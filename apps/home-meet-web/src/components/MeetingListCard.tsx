import { IMeeting, StyleProps } from '@/util';
import { Avatar, Button, Col, Row, Tooltip } from 'antd';
import clsx from 'clsx';
import React from 'react';
import { BsFillMicFill } from 'react-icons/bs';

export type MeetCardComponentProps = StyleProps & {
  clickJoin?: () => void;
  meet: IMeeting;
};

const DEFAULT_PROPS = {} as const;

export function MeetingListCard(props: MeetCardComponentProps) {
  const p = { ...DEFAULT_PROPS, ...props };
  return (
    <div className={clsx(p.className, 'w-full hover:bg-[#eae8e7]')}>
      <Row className="w-full pt-1 py-2">
        <Col xs={6} sm={4} md={4}>
          <Avatar src={p.meet.creator.pic} />
        </Col>
        <Col xs={12} sm={16} md={16} className="pt-2">
          <p className="text-[15px] font-bold m-0">{p.meet.title}</p>
        </Col>
        <Col xs={6} sm={4} md={4}>
          <Tooltip title="Join Meeting">
            <Button
              icon={<BsFillMicFill />}
              shape="circle"
              onClick={p.clickJoin}
            />
          </Tooltip>
        </Col>
      </Row>
    </div>
  );
}
