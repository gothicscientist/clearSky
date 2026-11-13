import type { ComponentRef, Ref } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { hit, radius, space, type as typeScale, useTheme } from '@/theme';

import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export interface TextFieldProps extends Omit<TextInputProps, 'style' | 'ref'> {
  label?: string;
  testID: string;
  icon?: IconName;
  /** Helper or error line under the field */
  hint?: string;
  ref?: Ref<ComponentRef<typeof TextInput>>;
}

export function TextField({ label, testID, icon, hint, multiline, ref, ...rest }: TextFieldProps) {
  const { c, isDark } = useTheme();
  return (
    <View style={styles.wrap}>
      {label ? (
        <Text variant="label" tone="secondary">
          {label}
        </Text>
      ) : null}
      <View
        style={[
          styles.field,
          multiline && styles.multiline,
          { backgroundColor: c.raised, borderColor: c.line },
        ]}>
        {icon ? <Icon name={icon} size={20} color={c.textSecondary} /> : null}
        <TextInput
          ref={ref}
          testID={testID}
          accessibilityLabel={rest.accessibilityLabel ?? label ?? rest.placeholder}
          placeholderTextColor={c.textTertiary}
          selectionColor={c.horizon}
          cursorColor={c.horizon}
          keyboardAppearance={isDark ? 'dark' : 'light'}
          multiline={multiline}
          maxFontSizeMultiplier={1.6}
          style={[
            styles.input,
            { color: c.text, fontSize: typeScale.body.fontSize },
            multiline && { textAlignVertical: 'top', minHeight: 96 },
          ]}
          {...rest}
        />
      </View>
      {hint ? (
        <Text variant="caption" tone="secondary">
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.xs },
  field: {
    minHeight: hit.min + 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.md,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  multiline: { alignItems: 'flex-start', paddingVertical: space.md },
  input: { flex: 1, paddingVertical: space.sm },
});
