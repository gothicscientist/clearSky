import { Redirect } from 'expo-router';

import { useAccess } from '@/lib/access';
import { routes } from '@/lib/routes';

/** Entry point: sends people to the one place their state allows. */
export default function Index() {
  const { stage } = useAccess();
  if (stage === 'onboarding') return <Redirect href={routes.onboarding} />;
  if (stage === 'paywall') return <Redirect href={routes.paywall} />;
  return <Redirect href={routes.today} />;
}
