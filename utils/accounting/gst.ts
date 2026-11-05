export type GstSplit = {
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  tax_amount: number;
};

function roundToPaise(amount: number) {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

export function isRajasthanState(partyState: string | null | undefined) {
  const normalizedState = partyState?.trim().toLowerCase().replace(/[\s.]/g, '');
  return (
    normalizedState === 'rajasthan' ||
    normalizedState === 'rj' ||
    normalizedState === '08'
  );
}

export function splitGstByPartyState(amount: number, partyState: string | null | undefined): GstSplit {
  const taxAmount = roundToPaise(amount);

  if (!isRajasthanState(partyState)) {
    return {
      cgst_amount: 0,
      sgst_amount: 0,
      igst_amount: taxAmount,
      tax_amount: taxAmount,
    };
  }

  const cgstAmount = roundToPaise(taxAmount / 2);
  return {
    cgst_amount: cgstAmount,
    sgst_amount: roundToPaise(taxAmount - cgstAmount),
    igst_amount: 0,
    tax_amount: taxAmount,
  };
}
