import { Input, useForm } from 'hooks/useForm';
import React, { useRef } from 'react';
import { faComment, faEnvelope } from '@fortawesome/free-regular-svg-icons';
import { toastError, toastSuccess } from 'features/toast';
import Button from 'components/button';
import { Helmet } from 'react-helmet';
import Recaptcha from 'components/recaptcha';
import axios from 'axios';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { useDispatch } from 'react-redux';

const Contact = () => {
  const dispatch = useDispatch();
  const captchaRef = useRef();

  const onSubmit = async values => {
    try {
      const res = await axios.post('/api/email/contact', values);
      dispatch(toastSuccess(res.data.success));
    } catch (error) {
      dispatch(toastError(error.response.data.error));
    } finally {
      captchaRef.current.reset();
    }
  };

  const { errors, hasErrors, handleChange, handleSubmit, isPristine, isSubmitting, setErrors, values } = useForm({
    validate
  });

  return (
    <main className="container">
      <Helmet>
        <title>Contact Us</title>
        <meta name="description" content="Get in touch with the nemp3 team." />
      </Helmet>
      <div className="row">
        <div className="col py-3 mb-4">
          <h2 className="text-center mt-4">Contact Us</h2>
          <p>
            Please get in touch using the contact form below if you have any queries, suggestions, or need help with
            anything. We&rsquo;ll be in touch as soon as possible.
          </p>
          <form className="form-row mt-5" onSubmit={handleSubmit(onSubmit)}>
            <div className="col-md-6 mx-auto">
              <Input
                error={errors.email}
                icon={faEnvelope}
                label="Email Address:"
                name="email"
                onChange={handleChange}
                placeholder="Email Address"
                type="email"
                required
                value={values.email || ''}
              />
              <Input
                error={errors.message}
                icon={faComment}
                element="textarea"
                label="Your Message:"
                name="message"
                onChange={handleChange}
                placeholder="Enter your message."
                rows={6}
                required
                value={values.message || ''}
              />
              <Recaptcha
                error={errors.recaptcha}
                onChange={handleChange}
                name={'recaptcha'}
                onError={error => setErrors(prev => ({ ...prev, recaptcha: String(error) }))}
                captchaRef={captchaRef}
              />
              <div className="d-flex justify-content-end">
                <Button
                  className="my-3"
                  icon={faCheck}
                  type="submit"
                  disabled={hasErrors || isPristine || isSubmitting}
                >
                  Send Message
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

const validate = ({ email, message, recaptcha }) => {
  const errors = {};
  if (!email) errors.email = 'Please enter your email address.';
  if (!message) errors.message = 'Please enter a message.';
  if (!recaptcha) errors.recaptcha = 'Please complete the recaptcha.';
  return errors;
};

export default Contact;
