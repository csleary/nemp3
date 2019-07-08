import classNames from 'classnames';
import throttle from 'lodash.throttle';
import React, { useState, useEffect } from 'react';
import FontAwesome from 'react-fontawesome';
import { connect } from 'react-redux';
import { Link, NavLink, withRouter } from 'react-router-dom';
import DashNavbar from './dashboard/DashNavbar';
import PrivateRoute from './PrivateRoute';
import { fetchCatalogue, fetchUser, logOut, toastSuccess } from '../actions';
import Logo from './Logo';
import SearchBar from './SearchBar';
import '../style/navbar.css';

const NavBar = props => {
  const {
    user: { auth, credit, isLoading }
  } = props;

  const [showLogo, setShowLogo] = useState(false);

  useEffect(() => {
    document.addEventListener('scroll', throttle(handleScroll, 200));

    return () => {
      document.removeEventListener('scroll', handleScroll);
    };
  });

  const handleLogout = () => {
    props.logOut(res => {
      props.history.push('/login');
      props.fetchUser();
      props.toastSuccess(res.data.success);
    });
  };

  const handleScroll = () => {
    const navbarPos = document.getElementsByClassName('navbar')[0].offsetTop;
    const scrollPos = window.pageYOffset;

    if (scrollPos < navbarPos) {
      setShowLogo(false);
    } else {
      setShowLogo(true);
    }
  };

  const renderUserLinks = () => {
    if (isLoading) return null;

    if (!auth) {
      return (
        <li className="nav-item">
          <NavLink to={'/login'} className="nav-link">
            <FontAwesome
              name="sign-in"
              className="mr-1"
              title="Click to log in."
            />
            <span className="nav-label">Log In</span>
          </NavLink>
        </li>
      );
    }

    const creditClass = classNames('credit', {
      cyan: credit > 1,
      yellow: credit === 1,
      red: credit === 0
    });

    return (
      <>
        <li className="nav-item">
          <NavLink
            to={'/release/add/'}
            className="nav-link"
            title="Add a new release."
          >
            <FontAwesome name="plus-square" className="mr-1" />
            <span className="nav-label">Add Release</span>
            <span
              className={creditClass}
              title={`Your nemp3 credit balance is: ${credit}`}
            >
              <FontAwesome name="certificate" className="ml-1" />{' '}
            </span>
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink
            to={'/dashboard'}
            className="nav-link"
            title="Visit your dashboard."
          >
            <FontAwesome name="user-circle" className="mr-1" />
            <span className="nav-label">Dashboard</span>
          </NavLink>
        </li>
        <li className="nav-item">
          <button className="nav-link" onClick={handleLogout}>
            <FontAwesome
              name="sign-out"
              className="mr-1"
              title="Log out of your account."
            />
            <span className="nav-label">Log out</span>
          </button>
        </li>
      </>
    );
  };

  const navbarClass = classNames('navbar-nav', 'ml-auto', {
    loaded: !props.user.isLoading
  });

  const brandClass = classNames('navbar-brand-link', 'ml-3', {
    show: showLogo
  });

  return (
    <nav className="navbar sticky-top navbar-expand-lg">
      <SearchBar />
      <PrivateRoute path="/dashboard" component={DashNavbar} />
      <Link to={'/'} className={brandClass}>
        <Logo class="navbar-brand" />
      </Link>
      <ul className={navbarClass}>{renderUserLinks()}</ul>
    </nav>
  );
};

function mapStateToProps(state) {
  return {
    user: state.user
  };
}

export default withRouter(
  connect(
    mapStateToProps,
    { fetchCatalogue, fetchUser, logOut, toastSuccess }
  )(NavBar)
);
