import { AppContext } from '@/providers';
import { axiosClient, StyleProps } from '@/util';
import { Button, Form, Input, Modal, notification, Typography } from 'antd';
import { useRouter } from 'next/router';
import React, { ReactElement, useContext } from 'react';
import { useQuery } from 'react-query';

export type CreateMeetingComponentProps = StyleProps & {
  isVisible?: boolean;
  onCancel?: () => void;
  onCreateMeeting?: () => void;
};

const DEFAULT_PROPS = {} as const;

export function CreateMeeting(
  props: CreateMeetingComponentProps
): ReactElement {
  const p = { ...DEFAULT_PROPS, ...props };
  const [form] = Form.useForm();
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const { setMeetingsCtx, profile, addNewMeetingCtx } = useContext(AppContext);
  const router = useRouter();

  const { refetch, isFetching } = useQuery(
    ['create-meeting'],
    async () => {
      return axiosClient.post('/meet/create', {
        title,
        description,
        creator: profile.id,
      });
    },
    {
      enabled: false,
      onSuccess: (res) => {
        const result = {
          status: res.status + '-' + res.statusText,
          headers: res.headers,
          data: res.data,
        };
        notification.success({
          message: 'New meeting created successfully',
        });

        router.push(`/meet/${result?.data?.data?._id}`);
      },
      onError(err: any) {
        console.log(err);
        const errorMsg = err?.response?.data?.message ?? 'Something went wrong';
        notification.error({
          message: errorMsg,
        });
      },
    }
  );

  const createMeetingRequest = async () => {
    console.log(profile);
    await refetch();
  };

  return (
    <Modal open={p.isVisible} onCancel={p.onCancel} onOk={createMeetingRequest}>
      <Form form={form} layout="vertical" name="basic">
        <Form.Item
          name="title"
          rules={[
            {
              required: true,
              message: 'Please title requred',
            },
          ]}
          label={
            <Typography.Text className="text-[#757575] text-[16px] font-bold">
              Title
            </Typography.Text>
          }
        >
          <Input
            placeholder="GDCS 2021"
            onChange={(e) => setTitle(e.target.value)}
          />
        </Form.Item>
        <Form.Item
          name="Description"
          label={
            <Typography.Text className="text-[#757575] text-[16px] font-bold">
              Description
            </Typography.Text>
          }
        >
          <Input.TextArea
            placeholder="**********"
            onChange={(e) => setDescription(e.target.value)}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
