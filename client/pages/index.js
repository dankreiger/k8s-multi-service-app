import Link from 'next/link';
import buildClient from '../api/build-client';

const LandingPage = ({ currentUser }) =>
  currentUser ? (
    <h3>
      You are signed in as: <code>{currentUser?.email}</code>
    </h3>
  ) : (
    <h3>You are not signed in</h3>
  );

LandingPage.getInitialProps = async (context) => {
  const client = buildClient(context);
  const { data } = await client.get('/api/users/currentuser');
  return data;
};

export default LandingPage;
