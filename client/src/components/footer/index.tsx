import { shallowEqual, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import React from 'react';
import { RootState } from 'index';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import styles from './footer.module.css';

const today = new Date();
const year = today.getFullYear();

const Footer: React.FC = () => {
  const user = useSelector((state: RootState) => state.user, shallowEqual);
  const { auth } = user;

  return (
    <footer className={`${styles.footer} container-fluid`}>
      <div className={`${styles.links} row`}>
        <div className="col col-sm-2">
          <ul className={styles.list}>
            <li>
              <Link to={'/about'}>About</Link>
            </li>
            <li>
              <Link to={'/contact'}>Contact</Link>
            </li>
            <li>
              <Link to={'/support'}>Support</Link>
            </li>
            <li>
              <a href="https://nem.io/" title="Visit the official NEM site.">
                NEM
                <FontAwesomeIcon icon={faExternalLinkAlt} className={styles.icon} />
              </a>
            </li>
          </ul>
        </div>
        {!auth ? (
          <div className="col col-sm-2">
            <ul className={styles.list}>
              <li>
                <Link to={'/login'}>Log In</Link>
              </li>
              <li>
                <Link to={'/register'}>Register</Link>
              </li>
              <li>
                <Link to={'/reset'}>Forgot Password?</Link>
              </li>
            </ul>
          </div>
        ) : null}
        {auth ? (
          <div className="col col-sm-2">
            <ul className={styles.list}>
              <li>
                <Link to={'/release/add/'}>Add Release</Link>
              </li>
              <li>
                <Link to={'/dashboard'}>Dashboard</Link>
              </li>
              <li>
                <Link to={'/dashboard/collection'}>Collection</Link>
              </li>
              <li>
                <Link to={'/dashboard/nem-address'}>Your NEM Address</Link>
              </li>
            </ul>
          </div>
        ) : null}
      </div>
      <div className="row">
        <div className={`${styles.credits} col`}>
          <small>
            &copy; <span>2017&ndash;</span>
            {year} <a href="https://ochremusic.com">Christopher Leary</a>
          </small>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
