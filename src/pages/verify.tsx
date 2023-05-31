import { getLayout } from '@/components/layouts/layout';
import Link from '@/components/ui/link';
import { useVerifyEmailMutation } from '../framework/rest/user';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import router from 'next/router';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const VerifyEmail = () => {
  const EmailStatus = {
    VERIFYING: 'Verifying',
    FAILED: 'Failed',
  };
  const [emailStatus, setEmailStatus] = useState(EmailStatus.VERIFYING);
  const { mutate: verify, isLoading: loading } = useVerifyEmailMutation();

  useEffect(() => {
    const { token: emailToken }: any = router.query;
    verify(
      { emailToken },
      {
        onSuccess: (data: any) => {
          toast.success(data.message);
          router.push("/")
        },
        onError: (error: any) => {
          console.log('veri-error', error.response.data);
          setEmailStatus(EmailStatus.FAILED);
          toast.error(error?.response?.data?.message)
        },
      }
    );
  }, []);

  const getBody = () => {
    switch (emailStatus) {
      case EmailStatus.VERIFYING:
        return <div>Verifying...</div>;
      case EmailStatus.FAILED:
        return (
          <div>
            Verification failed, you can also verify your account using the{' '}
            <Link href="forgot-password">forgot password</Link> page.
          </div>
        );
    }
  };

  return (
    <>
      <div className="w-full mx-auto py-8 px-4 lg:py-10 lg:px-8 xl:py-14 xl:px-16 2xl:px-20">
        {getBody()}
      </div>
    </>
  );
};

export default VerifyEmail;

VerifyEmail.getLayout = getLayout;

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale!, ['common', 'policy'])),
    },
  };
};
