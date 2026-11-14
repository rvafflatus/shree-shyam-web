type TransportChargeRow = {
  freight_charge?: unknown;
  handling_charge?: unknown;
  toll_charge?: unknown;
  other_charge?: unknown;
  total_transport_amount?: unknown;
};

function amountOrZero(value: unknown) {
  const amount = typeof value === 'number' || typeof value === 'string'
    ? Number(value)
    : 0;
  return Number.isFinite(amount) && amount > 0 ? amount : 0;
}

export function getTotalTransportAmount(row: TransportChargeRow) {
  const componentTotal =
    amountOrZero(row.freight_charge) +
    amountOrZero(row.handling_charge) +
    amountOrZero(row.toll_charge) +
    amountOrZero(row.other_charge);

  const total = componentTotal || amountOrZero(row.total_transport_amount);
  return Math.round((total + Number.EPSILON) * 100) / 100;
}
