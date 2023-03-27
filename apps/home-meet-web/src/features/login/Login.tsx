import { AppContext } from '@/providers';
import { axiosClient } from '@/util';
import {
  Button,
  Checkbox,
  Col,
  Form,
  Input,
  notification,
  Row,
  Typography,
} from 'antd';
import { useRouter } from 'next/router';
import React, { useContext } from 'react';
import { useQuery } from 'react-query';

export function Login() {
  const [form] = Form.useForm();
  const { setProfileCtx, setTokenCtx, setIsLoggedCtx, isLogged } =
    useContext(AppContext);

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const router = useRouter();

  if (isLogged) {
    router.push('/');
  }

  const { refetch: loginUser, isFetching } = useQuery(
    ['login'],
    async () => {
      return axiosClient.post('/auth/login', {
        email,
        password,
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
          message: 'Login successfully',
        });

        setProfileCtx!(result?.data?.data);
        setTokenCtx!(result?.data?.accessToken);
        setIsLoggedCtx!(true);
        router.push('/');
      },
      onError(err: any) {
        const errorMsg = err?.response?.data?.message ?? 'Something went wrong';
        notification.error({
          message: errorMsg,
        });
      },
    }
  );

  const onFinish = (values: { email: string; password: string }) => {
    loginUser();
  };
  return (
    <Row
      className="bg-[#b039cc] h-screen flex items-center justify-center xs:py-[5px]"
      align="middle"
      justify="center"
    >
      <Col
        xs={22}
        sm={20}
        md={16}
        lg={12}
        className="h-[350px] bg-white rounded-[10px] flex items-center justify-center"
      >
        <Form
          form={form}
          layout="vertical"
          name="basic"
          initialValues={{
            remember: true,
          }}
          onFinish={onFinish}
          className="w-[70%]"
        >
          <Form.Item
            name="email"
            rules={[
              {
                required: true,
                message: 'Please email requred',
              },
              {
                type: 'email',
                message: 'Please enter a valid email address',
              },
            ]}
            label={
              <Typography.Text className="text-[#757575] text-[16px] font-bold">
                Email
              </Typography.Text>
            }
          >
            <Input
              placeholder="example@123.com"
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[
              {
                required: true,
                message: 'Password required ',
              },
            ]}
            label={
              <Typography.Text className="text-[#757575] text-[16px] font-bold">
                Password
              </Typography.Text>
            }
          >
            <Input.Password
              placeholder="**********"
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              className="w-full"
              htmlType="submit"
              loading={isFetching}
            >
              Login
            </Button>
          </Form.Item>
        </Form>
      </Col>
    </Row>
  );
}
