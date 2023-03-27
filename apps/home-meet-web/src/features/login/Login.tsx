import { Button, Checkbox, Col, Form, Input, Row, Typography } from 'antd';
import React from 'react';

export function Login() {
  const [form] = Form.useForm();

  const onFinish = (values: { email: string; password: string }) => {};
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
            <Input placeholder="example@123.com" />
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
            <Input.Password placeholder="**********" />
          </Form.Item>
          <Form.Item>
            <Row>
              <Col span={12} className="text-left">
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox>Remember me</Checkbox>
                </Form.Item>
              </Col>
            </Row>
          </Form.Item>
          <Form.Item>
            <Button type="primary" className="w-full" htmlType="submit">
              Login
            </Button>
          </Form.Item>
        </Form>
      </Col>
    </Row>
  );
}
