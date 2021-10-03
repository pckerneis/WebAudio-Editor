export function consumeEvent(evt: any) {
  evt.stopPropagation();
}

export function isEnterKeyEvent(evt: any) {
  return ['Enter', 'NumpadEnter'].includes(evt?.code);
}

export function isEscapeKeyEvent(evt: any) {
  return evt?.code === 'Escape';
}
