import { ElMessageBox } from "element-plus";
import type { ElMessageBoxOptions } from "element-plus";

const HC_CLASS = "hc-message-box";

function withDefaults(options?: ElMessageBoxOptions): ElMessageBoxOptions {
  if (!options) return { customClass: HC_CLASS };
  return {
    ...options,
    customClass: options.customClass
      ? `${HC_CLASS} ${options.customClass}`
      : HC_CLASS,
  };
}

export const HcMessageBox = {
  confirm: (
    message: Parameters<typeof ElMessageBox.confirm>[0],
    title?: string,
    options?: ElMessageBoxOptions,
  ) => ElMessageBox.confirm(message, title ?? "", withDefaults(options)),

  alert: (
    message: Parameters<typeof ElMessageBox.alert>[0],
    title?: string,
    options?: ElMessageBoxOptions,
  ) => ElMessageBox.alert(message, title ?? "", withDefaults(options)),

  prompt: (
    message: Parameters<typeof ElMessageBox.prompt>[0],
    title?: string,
    options?: ElMessageBoxOptions,
  ) => ElMessageBox.prompt(message, title ?? "", withDefaults(options)),
} as const;

export default HcMessageBox;
