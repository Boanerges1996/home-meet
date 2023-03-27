import { NavbarComponent } from '@/components';
import { AppContext } from '@/providers';
import { Button, Col, notification, Row, Space } from 'antd';
import { useRouter } from 'next/router';
import React, { useContext } from 'react';
import { CreateMeeting, OnGoingMeetings } from '../meet';

export function Landing(): React.ReactElement {
  const [showCreateMeeting, setShowCreateMeeting] = React.useState(false);
  const { isLogged } = useContext(AppContext);

  const router = useRouter();

  const createMeeting = () => {
    if (!isLogged) {
      notification.warning({
        message: 'Please login before you can create a meeting',
        duration: 2,
      });
      return;
    }

    setShowCreateMeeting(true);
  };
  return (
    <div className="bg-white w-[100vw] h-[100vh] bg-[url('/svg/amoeba.svg')] bg-no-repeat">
      <NavbarComponent
        isLogged={isLogged}
        clickLogin={() => router.push('/login')}
        clickSignup={() => router.push('/signup')}
      />
      {showCreateMeeting && (
        <CreateMeeting
          isVisible={true}
          onCancel={() => setShowCreateMeeting(false)}
        />
      )}
      <div className="xs:h-[40vh] sm:h-[50vh] md:h-[90vh] !important h-[90vh]">
        <Row>
          <Col xs={22} sm={22} md={16}>
            <div className="flex xs:h-[40vh] sm:h-[50vh] md:h-[90vh] !important h-[90vh] items-center justify-center">
              <Space direction="vertical">
                <p className="text-[25px] text-center m-0">Home Meet</p>
                <p className="text-[15px] text-center">
                  Create and join meetings seemlessly
                </p>
                <Button onClick={createMeeting}>Create Meeting</Button>
              </Space>
            </div>
          </Col>
          <Col
            xs={22}
            sm={22}
            md={8}
            className="border-1 border-solid border-[#e7e7e7] rounded h-[90vh]"
          >
            <OnGoingMeetings />
          </Col>
        </Row>
      </div>
    </div>
  );
}
