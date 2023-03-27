import { Button, Col, Form, Input, Row, Typography } from 'antd';
import React from 'react';

export function Signup() {
  const [form] = Form.useForm();

  const onFinish = (values: {
    name: string;
    email: string;
    password: string;
  }) => {
    console.log(values);
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
        className="h-[450px] bg-white rounded-[10px] flex items-center justify-center"
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
            name="name"
            rules={[
              {
                required: true,
                message: 'Please email requred',
              },
            ]}
            label={
              <Typography.Text className="text-[#757575] text-[16px] font-bold">
                Name
              </Typography.Text>
            }
          >
            <Input placeholder="john doe" />
          </Form.Item>
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
            <Button type="primary" className="w-full" htmlType="submit">
              Signup
            </Button>
          </Form.Item>
        </Form>
      </Col>
    </Row>
  );
}
