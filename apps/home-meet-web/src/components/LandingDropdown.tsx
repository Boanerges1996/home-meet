import { AppContext } from '@/providers';
import { StyleProps } from '@/util';
import { Avatar, Button, Dropdown } from 'antd';
import clsx from 'clsx';
import React, { useContext } from 'react';
import { FiMenu } from 'react-icons/fi';

export type LandingComponentProps = StyleProps & {
  isLogged?: boolean;
  clickLogin?: () => void;
  clickSignup?: () => void;
  clickLogout?: () => void;
  clickProfile?: () => void;
};

const DEFAULT_PROPS = {} as const;

export function LandingDropdown(props: LandingComponentProps) {
  const p = { ...DEFAULT_PROPS, ...props };
  const {
    profile: { pic },
  } = useContext(AppContext);

  return (
    <div className={clsx(p.className, 'text-right')}>
      {!props.isLogged && (
        <Dropdown
          menu={{
            items: [
              {
                key: '1',
                label: 'Login',
                onClick: p.clickLogin,
              },
              {
                key: '2',
                label: 'Signup',
                onClick: p.clickSignup,
              },
            ],
          }}
        >
          <Button icon={<FiMenu size={18} />} />
        </Dropdown>
      )}

      {props.isLogged && (
        <Dropdown
          menu={{
            items: [
              {
                key: '1',
                label: 'Profile',
                onClick: p.clickProfile,
              },
              {
                key: '2',
                label: 'Logout',
                onClick: p.clickLogout,
              },
            ],
          }}
        >
          <Avatar src={pic} />
        </Dropdown>
      )}
    </div>
  );
}
