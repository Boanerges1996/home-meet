import { StyleProps } from '@/util';
import { Button, Col, Row, Space, Typography } from 'antd';
import clsx from 'clsx';
import { LandingDropdown } from './LandingDropdown';

export type NavbarComponentProps = StyleProps & {
  isLogged?: boolean;
  clickLogin?: () => void;
  clickSignup?: () => void;
  clickLogout?: () => void;
  clickProfile?: () => void;
};

const DEFAULT_PROPS = {} as const;

export function NavbarComponent(props: NavbarComponentProps) {
  const p = { ...DEFAULT_PROPS, ...props };

  return (
    <div className={clsx(p.className, 'pt-[10px] py-2')}>
      <Row className="w-full">
        <Col xs={12} sm={12} md={8} className="text-left pl-[5px] font-bold">
          <p className="text-[18px] m-0">HomeMeet</p>
        </Col>
        <Col xs={0} sm={0} md={16} className="text-right pr-[5px]">
          <Space>
            <Button onClick={p.clickLogin}>Login</Button>
            <Button type="primary" onClick={p.clickSignup}>
              Signup
            </Button>
          </Space>
        </Col>
        <Col xs={12} sm={12} md={0} className="text-right pr-[5px]">
          <LandingDropdown
            clickLogin={p.clickLogin}
            clickLogout={p.clickLogout}
            clickSignup={p.clickSignup}
            clickProfile={p.clickProfile}
          />
        </Col>
      </Row>
    </div>
  );
}
