import { Navigate, useParams } from 'react-router-dom';

/** Permanent redirect preserving dynamic segments for legacy URLs. */
export function LegacyRedirect({
  to,
}: {
  to: (params: Record<string, string | undefined>) => string;
}) {
  const params = useParams();
  return <Navigate to={to(params)} replace />;
}
