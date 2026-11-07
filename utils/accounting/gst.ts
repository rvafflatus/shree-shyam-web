export type GstSplit = {
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  tax_amount: number;
};

export function getPartyState(state: string | null | undefined, address: string | null | undefined) {
  if (state?.trim()) return state.trim();

  const addressLines = address?.split(/\r?\n/);
  const locationLine = addressLines?.[1];
  if (!locationLine) return null;

  const parts = locationLine.split(',').map((part) => part.trim());
  return parts.length >= 2 ? parts[1] || null : null;
}

export function setPartyAddressState(
  address: string | null | undefined,
  state: string | null | undefined,
) {
  const lines = (address ?? '').split(/\r?\n/);
  const normalizedState = state?.trim() ?? '';

  if (lines.length > 1) {
    const locationParts = lines[1].split(',').map((part) => part.trim());
    if (locationParts.length >= 2) {
      locationParts[1] = normalizedState;
      lines[1] = locationParts.filter((part, index) => part || index === 1).join(', ');
    } else if (normalizedState) {
      lines[1] = normalizedState;
    } else {
      lines.splice(1, 1);
    }
  } else if (normalizedState) {
    lines.push(normalizedState);
  }

  return lines.filter((line, index) => line || index === 0).join('\n') || null;
}

export function isMissingPartyStateColumn(message: string) {
  const normalizedMessage = message.toLowerCase();
  return normalizedMessage.includes('state') &&
    (normalizedMessage.includes('column') || normalizedMessage.includes('schema cache'));
}

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
