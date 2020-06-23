/* eslint react/prop-types: 0 */
import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { uniqueId } from 'lodash';
import {
  Input, InputNumber, Checkbox, Button,
} from 'antd';
import { UserOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { createNewUser } from '../API';
import 'antd/dist/antd.css';
import './app.css';

const initialValues = {
  name: '',
  password: '',
  repeatPassword: '',
  email: '',
  website: '',
  age: 0,
  currentSkill: '',
  skills: [],
  acceptTerms: false,
};

const registrationSchema = Yup.object().shape({
  name: Yup.string()
    .max(50, 'Слишком длинное имя!')
    .required('Заполните поле'),
  password: Yup.string()
    .min(8, 'Слишком короткий')
    .max(50, 'Слишком длинный')
    .matches(/^[A-Za-z0-9]+$/, 'Пароль может содержать только латинские символы и цифры')
    .matches(/(?=.*[0-9])/, 'Пароль должен содержать хотя бы одну цифру')
    .matches(/(?=.*[A-Z])/, 'Пароль должен содержать хотя бы одну заглавную букву')
    .required('Заполните поле'),
  repeatPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Пароли должны совпадать')
    .required('Заполните поле'),
  email: Yup.string()
    .email('Некорректный email')
    .required('Заполните поле'),
  website: Yup.string()
    .url('Некорректный адрес сайта'),
  age: Yup.number()
    .min(18, 'Вам должно быть 18')
    .max(65, 'Почему нельзя регистрироваться после 65?'),
  acceptTerms: Yup.bool()
    .oneOf([true], 'Необходимо принять соглашение'),
});

const App = () => {
  const [isFormDisabled, setFormDisabled] = useState(false);

  const handleOnChangeAge = (value, setFieldValue) => {
    setFieldValue('age', value);
  };

  const handleOnAddSkill = (event, setFieldValue, currentSkillValue, currentSkillsList) => {
    event.preventDefault();
    const isInputEmpty = currentSkillValue.trim().length === 0;
    if (isInputEmpty) {
      setFieldValue('currentSkill', '');
      return false;
    }

    const newSkill = {
      title: currentSkillValue,
      id: uniqueId(),
    };

    const newSkillsList = [...currentSkillsList, newSkill];
    setFieldValue('skills', newSkillsList);
    setFieldValue('currentSkill', '');
    return true;
  };

  const handleOnRemoveSkill = (idx, skills, setFieldValue) => () => {
    const newSkillsList = skills.filter((skill) => skills.indexOf(skill) !== idx);
    setFieldValue('skills', newSkillsList);
  };

  const renderSkillsList = (skills, setFieldValue) => {
    if (skills.length === 0) return null;

    return (
      skills.map((skill) => {
        const skillIndex = skills.indexOf(skill);
        const { id, title } = skill;
        return (
          <div key={id} className="skill-list-wrapper">
            <div className="skill-list-wrapper-item">{title}</div>
            <button
              type="button"
              className="skill-list-wrapper-remove"
              onClick={handleOnRemoveSkill(skillIndex, skills, setFieldValue)}
            >
              X
            </button>
          </div>
        );
      })
    );
  };

  const handleOnSubmit = async (values, props) => {
    const { setSubmitting, setFieldError, resetForm } = props;
    try {
      setFormDisabled(true);
      const response = await createNewUser(values);
      switch (response.status) {
        case 200: {
          setFormDisabled(false);
          resetForm();
          alert('Вы успешно зарегистрированны'); // eslint-disable-line no-alert
          break;
        }
        case 500: {
          setFormDisabled(false);
          alert('Произошла ошибка на сервере, попробуйте позже'); // eslint-disable-line no-alert
          break;
        }
        default: {
          setFormDisabled(false);
          alert('Неизвестная ошибка'); // eslint-disable-line no-alert
        }
      }
    } catch (err) {
      if (err.message === 'Network Error') {
        alert('Ошибка соединения'); // eslint-disable-line no-alert
        setFormDisabled(false);
        return;
      }
      const { field, message } = err.response.data;
      setFieldError(field, message);
      setSubmitting(false);
      setFormDisabled(false);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={registrationSchema}
      onSubmit={handleOnSubmit}
    >
      {({
        values, handleChange, setFieldValue, handleSubmit, errors, touched,
      }) => (
        <Form className="form">
          <div className="form-item ">
            <label htmlFor="userName">Имя: </label>
            <Input
              id="name"
              name="name"
              onChange={handleChange}
              value={values.name}
              placeholder="Введите ваше имя"
              prefix={<UserOutlined className="site-form-item-icon" />}
              disabled={isFormDisabled}
            />
            {errors.name && touched.name ? (
              <div className="error">{errors.name}</div>
            ) : null}
          </div>

          <div className="form-item ">
            <label htmlFor="password">Введите пароль: </label>
            <Input.Password
              id="password"
              name="password"
              onChange={handleChange}
              value={values.password}
              placeholder="Введите пароль"
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              disabled={isFormDisabled}
            />
            {errors.password && touched.password ? (
              <div className="error">{errors.password}</div>
            ) : null}
          </div>

          <div className="form-item ">
            <label htmlFor="repeatPassword">Повторите пароль: </label>
            <Input.Password
              id="repeatPassword"
              name="repeatPassword"
              onChange={handleChange}
              value={values.repeatPassword}
              placeholder="Повторите пароль"
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              disabled={isFormDisabled}
            />
            {errors.repeatPassword && touched.repeatPassword ? (
              <div className="error">{errors.repeatPassword}</div>
            ) : null}
          </div>

          <div className="form-item ">
            <label htmlFor="email">Email: </label>
            <Input
              id="email"
              name="email"
              onChange={handleChange}
              value={values.email}
              placeholder="Введите ваш Email"
              disabled={isFormDisabled}
            />
            {errors.email && touched.email ? (
              <div className="error">{errors.email}</div>
            ) : null}
          </div>

          <div className="form-item ">
            <label htmlFor="website">Вебсайт (необязательно)</label>
            <Input
              id="website"
              name="website"
              onChange={handleChange}
              value={values.website}
              placeholder="Ваш вебсайт"
              disabled={isFormDisabled}
            />
            {errors.website && touched.website ? (
              <div className="error">{errors.website}</div>
            ) : null}
          </div>

          <div className="form-item ">
            <label htmlFor="age">Возраст: </label>
            <InputNumber
              id="age"
              name="age"
              onChange={(value) => handleOnChangeAge(value, setFieldValue)}
              max={65}
              min={0}
              defaultValue={0}
              value={values.age}
              placeholder="Возраст"
              disabled={isFormDisabled}
            />
            {errors.age && touched.age ? (
              <div className="error">{errors.age}</div>
            ) : null}
          </div>

          <div className="form-item ">
            <label htmlFor="skills">Навыки: </label>
            {(values.skills.length > 0) ? renderSkillsList(values.skills, setFieldValue) : null}
            <Input
              id="currentSkill"
              name="currentSkill"
              placeholder="Ваш навык"
              onChange={handleChange}
              value={values.currentSkill}
              disabled={isFormDisabled}
            />
            <Button
              type="danger"
              className="add-skill"
              disabled={isFormDisabled}
              onClick={(event) => (
                handleOnAddSkill(event, setFieldValue, values.currentSkill, values.skills))}
            >
              Добавить навык
            </Button>
          </div>

          <div className="form-item ">
            <Checkbox
              id="acceptTerms"
              name="acceptTerms"
              onChange={handleChange}
              checked={values.acceptTerms}
              disabled={isFormDisabled}
            >
              Согласен с политикой
            </Checkbox>
            {errors.acceptTerms && touched.acceptTerms ? (
              <div className="error">{errors.acceptTerms}</div>
            ) : null}
          </div>
          <div className="form-item ">
            <Button
              type="primary"
              onClick={handleSubmit}
              disabled={isFormDisabled}
            >
              Отправить
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default App;
