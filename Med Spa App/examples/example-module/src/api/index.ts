export default async function summaryHandler(req: Request) {
  const clinicId = req.headers.get('x-clinic-id');

  if (!clinicId) {
    return Response.json({ error: 'Missing clinic ID' }, { status: 400 });
  }

  return Response.json({
    clinic_id: clinicId,
    total_appointments: 142,
    revenue_this_month: 18400,
    active_patients: 87,
    generated_at: new Date().toISOString(),
  });
}
