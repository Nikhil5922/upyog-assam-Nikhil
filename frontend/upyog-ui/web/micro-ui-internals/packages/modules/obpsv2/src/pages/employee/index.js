import { PrivateRoute, BreadCrumb, BackButton } from "@upyog/digit-ui-react-components";
import React, { Fragment } from "react";
import { Switch, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";


const EmployeeApp = ({ path }) => {
  const location = useLocation()
  const { t } = useTranslation();
  const Inbox = Digit.ComponentRegistryService.getComponent("RTPInbox");

  return (
    <Fragment>
      {/* {!isFromNoc && !isRes ? <div style={isLocation ? {marginLeft: "10px"} : {}}><OBPSBreadCrumbs location={location} /></div> : null}
      {isFromNoc ? <BackButton style={{ border: "none", margin: "0", padding: "0" }}>{t("CS_COMMON_BACK")}</BackButton>: null} */}
      <Switch>
        
        <PrivateRoute path={`${path}/rtp/inbox`} component={(props) => <Inbox {...props} parentRoute={path} />} />

      </Switch>
    </Fragment>
  )
}

export default EmployeeApp;