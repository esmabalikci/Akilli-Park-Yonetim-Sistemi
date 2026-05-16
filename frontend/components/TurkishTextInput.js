import React, { forwardRef } from 'react';
import { TextInput, Platform } from 'react-native';

/**
 * Türkçe karakterler (ğ, ü, ş, ı, ö, ç, İ…) için uygun klavye ayarları.
 * variant: text | name | search | multiline | email | password
 */
const VARIANT_PROPS = {
  text: {
    keyboardType: 'default',
    autoCapitalize: 'sentences',
    autoCorrect: true,
    spellCheck: true,
    autoComplete: 'off',
  },
  name: {
    keyboardType: 'default',
    autoCapitalize: 'words',
    autoCorrect: true,
    spellCheck: true,
    autoComplete: 'name',
  },
  search: {
    keyboardType: 'default',
    autoCapitalize: 'words',
    autoCorrect: true,
    spellCheck: true,
    autoComplete: 'off',
  },
  multiline: {
    keyboardType: 'default',
    autoCapitalize: 'sentences',
    autoCorrect: true,
    spellCheck: true,
    autoComplete: 'off',
  },
  email: {
    keyboardType: 'email-address',
    autoCapitalize: 'none',
    autoCorrect: false,
    spellCheck: false,
    autoComplete: 'email',
    textContentType: 'emailAddress',
  },
  password: {
    keyboardType: 'default',
    autoCapitalize: 'none',
    autoCorrect: false,
    spellCheck: false,
    autoComplete: 'password',
    textContentType: 'password',
  },
};

const TurkishTextInput = forwardRef(function TurkishTextInput(
  { variant = 'text', style, ...rest },
  ref
) {
  const variantProps = VARIANT_PROPS[variant] || VARIANT_PROPS.text;

  return (
    <TextInput
      ref={ref}
      style={style}
      {...variantProps}
      importantForAutofill="no"
      {...(Platform.OS === 'android' ? { underlineColorAndroid: 'transparent' } : {})}
      {...rest}
    />
  );
});

export default TurkishTextInput;
