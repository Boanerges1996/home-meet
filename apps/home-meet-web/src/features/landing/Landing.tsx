import { NavbarComponent } from '@/components';
import { AppContext } from '@/providers';
import { Button, Space } from 'antd';
import React, { useContext } from 'react';

export function Landing(): React.ReactElement {
  const { isLogged } = useContext(AppContext);
  return (
    <div className="bg-white w-[100vw] h-[100vh] bg-[url('/svg/amoeba.svg')] bg-no-repeat">
      <NavbarComponent isLogged={isLogged} />
      <div className="flex xs:h-[40vh] sm:h-[50vh] md:h-[90vh] !important h-[90vh] items-center justify-center">
        <Space direction="vertical">
          <p className="text-[25px] text-center m-0">Home Meet</p>
          <p className="text-[15px] text-center">
            Create and join meetings seemlessly
          </p>
          <Button>Create Meeting</Button>
        </Space>
      </div>
    </div>
  );
}
