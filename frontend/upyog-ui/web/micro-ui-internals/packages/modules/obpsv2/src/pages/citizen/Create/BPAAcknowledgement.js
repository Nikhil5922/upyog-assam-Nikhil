import { Banner, Card, LinkButton, Loader, Row, StatusTable, SubmitBar, Toast } from "@upyog/digit-ui-react-components";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { bpaPayload } from "../../../utils";
// import getBPAAcknowledgementData from "../../../utils/getBPAAcknowledgementData";

const GetActionMessage = (props) => {
  const { t } = useTranslation();
  if (props.isSuccess) {
    return t("BPA_SUBMIT_SUCCESSFULL");
  }
  if (props.isLoading) {
    return t("BPA_APPLICATION_PENDING");
  }
  return t("BPA_APPLICATION_FAILED");
};

const rowContainerStyle = {
  padding: "4px 0px",
  justifyContent: "space-between",
};

const BannerPicker = (props) => {
  return (
    <Banner
      message={GetActionMessage(props)}
      applicationNumber={props.data?.bpa?.[0]?.applicationNo}
      info={props.isSuccess ? props.t("BPA_APPLICATION_NO") : ""}
      successful={props.isSuccess}
      style={{ width: "100%" }}
    />
  );
};

const BPAAcknowledgement = ({ data, onSuccess }) => {
  const { t } = useTranslation();
  const tenantId = Digit.ULBService.getCitizenCurrentTenant(true) || Digit.ULBService.getCurrentTenantId();
  const flow = window.location.href.includes("editApplication") ? "edit" : "create";
  const mutation = Digit.Hooks.obpsv2.useBPACreateUpdateApi(tenantId, flow);
  const user = Digit.UserService.getUser().info;
  const { data: storeData } = Digit.Hooks.useStore.getInitData();
  const { tenants } = storeData || {};
  const [showToast, setShowToast] = useState(null);

  useEffect(() => {
    try {
      data.tenantId = tenantId;
      let formdata = bpaPayload(data);
      mutation.mutate(formdata, { onSuccess });
    } catch (err) {
      setShowToast({ error: true, label: t("BPA_APPLICATION_SUBMIT_ERROR") });
    }
  }, []);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(null);
      }, 2000); // Close toast after 2 seconds
      return () => clearTimeout(timer); // Clear timer on cleanup
    }
  }, [showToast]);

  Digit.Hooks.useCustomBackNavigation({
    redirectPath: `upyog-ui/citizen`
  });

  // const handleDownloadPdf = async () => {
  //   try {
  //     let BPA = mutation.data?.BPA;
  //     const tenantInfo = tenants.find((tenant) => tenant.code === BPA.tenantId);
  //     let tenantId = BPA.tenantId || tenantId;
  //     const data = await getBPAAcknowledgementData({ ...BPA }, tenantInfo, t);
  //     Digit.Utils.pdf.generate(data);
  //   } catch (err) {
  //     setShowToast({ error: true, label: t("BPA_ACKNOWLEDGEMENT_PDF_ERROR") });
  //   }
  // };

  return mutation.isLoading || mutation.isIdle ? (
    <Loader />
  ) : (
    <Card>
      <BannerPicker t={t} data={mutation.data} isSuccess={mutation.isSuccess} isLoading={mutation.isIdle || mutation.isLoading} />
      <StatusTable>
         {mutation.isSuccess && (
            <Row
            rowContainerStyle={rowContainerStyle}
            last       
            textStyle={{ whiteSpace: "pre", width: "60%" }}
            />
        )}
      </StatusTable>
      {/* {mutation.isSuccess && <SubmitBar label={t("BPA_DOWNLOAD_ACKNOWLEDGEMENT")} onSubmit={handleDownloadPdf} />} */}
      {user?.type === "CITIZEN" ? (
        <Link to={`upyog-ui/citizen`}>
          <LinkButton label={t("CORE_COMMON_GO_TO_HOME")} />
        </Link>
      ) : (
        <Link to={`upyog-ui/employee`}>
          <LinkButton label={t("CORE_COMMON_GO_TO_HOME")} />
        </Link>
      )}
      {showToast && (
        <Toast
          error={showToast.error}
          warning={showToast.warning}
          label={t(showToast.label)}
          onClose={() => {
            setShowToast(null);
          }}
        />
      )}
    </Card>
  );
};

export default BPAAcknowledgement;