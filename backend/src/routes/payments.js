const express = require('express');
const crypto = require('crypto');
const { getPool, dbNotConfigured, toIso, sql, config } = require('../utils/dbHelpers');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

const RESERVATION_FEE_TRY = Number(process.env.RESERVATION_FEE_TRY || 50);

function mapPaymentMethodRow(row) {
  return {
    id: row.Id,
    cardLastFour: row.CardLastFour,
    cardBrand: row.CardBrand,
    cardName: row.CardName,
    expiryMonth: row.ExpiryMonth,
    expiryYear: row.ExpiryYear,
    isDefault: Boolean(row.IsDefault),
    createdAt: toIso(row.CreatedAt),
  };
}

function detectCardBrand(number) {
  const n = String(number).replace(/\s/g, '');
  if (n.startsWith('4')) return 'Visa';
  if (/^5[1-5]/.test(n)) return 'Mastercard';
  if (n.startsWith('9792')) return 'Troy';
  return 'Kart';
}

function mockTokenizeCard(cardNumber) {
  return `tok_${crypto.createHash('sha256').update(cardNumber).digest('hex').slice(0, 24)}`;
}

router.get('/payments/methods', authenticate, async (req, res) => {
  try {
    if (!config) return dbNotConfigured(res);

    const pool = await getPool();
    const result = await pool
      .request()
      .input('UserId', sql.Int, req.user.userId)
      .query(`
        SELECT Id, CardLastFour, CardBrand, CardName, ExpiryMonth, ExpiryYear, IsDefault, CreatedAt
        FROM PaymentMethods WHERE UserId = @UserId ORDER BY IsDefault DESC, CreatedAt DESC
      `);

    res.json({ success: true, methods: result.recordset.map(mapPaymentMethodRow) });
  } catch (error) {
    console.error('Ödeme yöntemleri hatası:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

router.post('/payments/methods', authenticate, async (req, res) => {
  try {
    if (!config) return dbNotConfigured(res);

    const { cardName, cardNumber, expiry, cvv, isDefault } = req.body;
    const digits = String(cardNumber || '').replace(/\s/g, '');

    if (!cardName || digits.length < 16 || !expiry || !cvv) {
      return res.status(400).json({
        success: false,
        message: 'Kart bilgileri eksik veya geçersiz.',
      });
    }

    const [expMonth, expYearRaw] = String(expiry).split('/');
    const expYear = expYearRaw?.length === 2 ? 2000 + parseInt(expYearRaw, 10) : parseInt(expYearRaw, 10);

    const pool = await getPool();

    if (isDefault) {
      await pool
        .request()
        .input('UserId', sql.Int, req.user.userId)
        .query('UPDATE PaymentMethods SET IsDefault = 0 WHERE UserId = @UserId');
    }

    const token = mockTokenizeCard(digits);
    const result = await pool
      .request()
      .input('UserId', sql.Int, req.user.userId)
      .input('CardLastFour', sql.NVarChar, digits.slice(-4))
      .input('CardBrand', sql.NVarChar, detectCardBrand(digits))
      .input('CardName', sql.NVarChar, cardName)
      .input('ExpiryMonth', sql.Int, parseInt(expMonth, 10))
      .input('ExpiryYear', sql.Int, expYear)
      .input('Token', sql.NVarChar, token)
      .input('IsDefault', sql.Bit, isDefault !== false)
      .query(`
        INSERT INTO PaymentMethods (
          UserId, CardLastFour, CardBrand, CardName, ExpiryMonth, ExpiryYear, Token, IsDefault
        )
        OUTPUT INSERTED.Id, INSERTED.CardLastFour, INSERTED.CardBrand, INSERTED.CardName,
               INSERTED.ExpiryMonth, INSERTED.ExpiryYear, INSERTED.IsDefault, INSERTED.CreatedAt
        VALUES (
          @UserId, @CardLastFour, @CardBrand, @CardName, @ExpiryMonth, @ExpiryYear, @Token, @IsDefault
        )
      `);

    res.status(201).json({
      success: true,
      method: mapPaymentMethodRow(result.recordset[0]),
    });
  } catch (error) {
    console.error('Kart eklenirken hata:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

router.delete('/payments/methods/:id', authenticate, async (req, res) => {
  try {
    if (!config) return dbNotConfigured(res);

    const id = parseInt(req.params.id, 10);
    const pool = await getPool();
    const result = await pool
      .request()
      .input('Id', sql.Int, id)
      .input('UserId', sql.Int, req.user.userId)
      .query('DELETE FROM PaymentMethods WHERE Id = @Id AND UserId = @UserId');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ success: false, message: 'Kart bulunamadı.' });
    }

    res.json({ success: true, message: 'Kart silindi.' });
  } catch (error) {
    console.error('Kart silinirken hata:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

router.post('/payments/charge', authenticate, async (req, res) => {
  try {
    if (!config) return dbNotConfigured(res);

    const { paymentMethodId, amount, reservationId, description } = req.body;
    const chargeAmount = Number(amount || RESERVATION_FEE_TRY);

    if (!paymentMethodId) {
      return res.status(400).json({
        success: false,
        message: 'Ödeme yöntemi seçilmelidir.',
      });
    }

    const pool = await getPool();
    const method = await pool
      .request()
      .input('Id', sql.Int, parseInt(paymentMethodId, 10))
      .input('UserId', sql.Int, req.user.userId)
      .query('SELECT Id, Token FROM PaymentMethods WHERE Id = @Id AND UserId = @UserId');

    if (!method.recordset[0]) {
      return res.status(404).json({ success: false, message: 'Ödeme yöntemi bulunamadı.' });
    }

    // Mock ödeme — gerçek entegrasyonda iyzico/PayTR API çağrılır
    const paymentResult = await pool
      .request()
      .input('UserId', sql.Int, req.user.userId)
      .input('ReservationId', sql.Int, reservationId ? parseInt(reservationId, 10) : null)
      .input('Amount', sql.Decimal(10, 2), chargeAmount)
      .input('Status', sql.NVarChar, 'completed')
      .input('PaymentMethodId', sql.Int, parseInt(paymentMethodId, 10))
      .input('Description', sql.NVarChar, description || 'Rezervasyon ücreti')
      .query(`
        INSERT INTO Payments (UserId, ReservationId, Amount, Currency, Status, PaymentMethodId, Description)
        OUTPUT INSERTED.Id, INSERTED.Amount, INSERTED.Status, INSERTED.CreatedAt
        VALUES (@UserId, @ReservationId, @Amount, 'TRY', @Status, @PaymentMethodId, @Description)
      `);

    res.json({
      success: true,
      message: 'Ödeme başarıyla alındı.',
      payment: {
        id: paymentResult.recordset[0].Id,
        amount: chargeResultAmount(paymentResult.recordset[0].Amount),
        status: paymentResult.recordset[0].Status,
        createdAt: toIso(paymentResult.recordset[0].CreatedAt),
      },
    });
  } catch (error) {
    console.error('Ödeme hatası:', error);
    res.status(500).json({ success: false, message: 'Ödeme işlemi başarısız.' });
  }
});

function chargeResultAmount(val) {
  return typeof val === 'number' ? val : parseFloat(val);
}

router.get('/payments/fee', (_req, res) => {
  res.json({ success: true, amount: RESERVATION_FEE_TRY, currency: 'TRY' });
});

module.exports = router;
