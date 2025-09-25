export function holdOffer(minutes = 15) {
  localStorage.setItem('offerHoldUntil', String(Date.now() + minutes * 60 * 1000));
}

export function isOfferHeld() {
  const v = localStorage.getItem('offerHoldUntil');
  if (!v) return false;
  return Date.now() < Number(v);
}
