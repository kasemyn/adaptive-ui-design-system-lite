import {
  resolveResponsiveValue,
  type ResponsiveValue,
} from '../responsive/responsiveValue';
import type {
  WindowHeightClass,
  WindowWidthClass,
} from '../responsive/windowSizeClass';

export type ModalPresentation = 'fullscreen' | 'dialog';
export type SheetPresentation = 'bottom' | 'side';

export const DEFAULT_MODAL_PRESENTATION: ResponsiveValue<ModalPresentation> = {
  compact: 'fullscreen',
  medium: 'dialog',
};

export const DEFAULT_SHEET_PRESENTATION: ResponsiveValue<SheetPresentation> = {
  compact: 'bottom',
  medium: 'side',
};

export function resolveModalPlacement(
  presentation: ResponsiveValue<ModalPresentation>,
  widthClass: WindowWidthClass,
  heightClass: WindowHeightClass,
): 'fullscreen' | 'dialog' {
  if (heightClass === 'compact') {
    return 'fullscreen';
  }
  return resolveResponsiveValue(presentation, widthClass) ?? 'fullscreen';
}

export function resolveSheetPlacement(
  presentation: ResponsiveValue<SheetPresentation>,
  widthClass: WindowWidthClass,
): 'bottomSheet' | 'sideSheet' {
  return resolveResponsiveValue(presentation, widthClass) === 'side'
    ? 'sideSheet'
    : 'bottomSheet';
}
