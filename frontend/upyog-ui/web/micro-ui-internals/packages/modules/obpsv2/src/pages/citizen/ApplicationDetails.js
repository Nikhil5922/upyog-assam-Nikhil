import {
    Card,
    CardSubHeader,
    Header,
    Loader,
    Row,
    StatusTable,
    MultiLink,
    Toast,
    CheckBox,
    PopUp,
    HeaderBar,
    ActionBar,
    Menu,
    Modal,
    SubmitBar,
    CardLabel,
    TextInput,
    TextArea,
    CardLabelDesc,
    UploadFile
  } from "@upyog/digit-ui-react-components";
  import React, { useState } from "react";
  import { useTranslation } from "react-i18next";
  import { useParams } from "react-router-dom";
  import get from "lodash/get";
  // import WFApplicationTimeline from "../../pageComponents/WFApplicationTimeline";
  // import getBPAAcknowledgementData from "../../utils/getBPAAcknowledgementData";
  
  /**
   * `BPAApplicationDetails` is a React component that fetches and displays detailed information for a specific Building Plan Approval (BPA) application.
   * It fetches data for the application using the `useBPASearchAPI` hook and displays the details in sections such as:
   * - Application Number
   * - Applicant Information (name, mobile number, email, father's name, mother's name, PAN, Aadhaar)
   * - Address Information (permanent and correspondence address)
   * - Land Details (construction type, plot details, adjoining owners, future provisions, technical person details)
   * 
   * The component also handles:
   * - Displaying a loading state (via a `Loader` component) while fetching data.
   * - A "toast" notification for any errors or status updates.
   * - Showing downloadable options via `MultiLink` if available.
   * 
   * @returns {JSX.Element} Displays detailed BPA application information with applicant details, address, and land details.
   */
  const BPAApplicationDetails = () => {
    const { t } = useTranslation();
    const { acknowledgementIds, tenantId } = useParams();
    const [showOptions, setShowOptions] = useState(false);
    const [showToast, setShowToast] = useState(null);
    const { data: storeData } = Digit.Hooks.useStore.getInitData();
    const { tenants } = storeData || {};
    const [displayMenu, setDisplayMenu] = useState(false);
    const { isLoading, isError, error, data, refetch } =Digit.Hooks.obpsv2.useBPASearchApi({
      tenantId,
      filters: { applicationNo: acknowledgementIds },
    });
    const [actioneError, setActionError] = useState(null);
    const [popup, setPopup] = useState(false);
    const [selectedAction, setSelectedAction] = useState(null);
    const [oldRTPName, setOldRTPName] = useState();
    const [ newRTPName, setNewRTPName ] = useState();
    const bpaApplicationDetail = get(data, "BPA", []);
    const [comments, setComments] = useState("");
    const [uploadedFile, setUploadedFile] = useState(null);
    const bpaId = get(data, "BPA[0].applicationNo", []);
  
    let bpa_details = (bpaApplicationDetail && bpaApplicationDetail.length > 0 && bpaApplicationDetail[0]) || {};
    const application = bpa_details;
  
    sessionStorage.setItem("bpa", JSON.stringify(application));
  
    const mutation = Digit.Hooks.obpsv2.useBPACreateUpdateApi(tenantId, "update");
  
    const { data: reciept_data, isLoading: recieptDataLoading } = Digit.Hooks.useRecieptSearch(
      {
        tenantId: tenantId,
        businessService: "bpa-services",
        consumerCodes: acknowledgementIds,
        isEmployee: false,
      },
      { enabled: acknowledgementIds ? true : false }
    );
  
    /**
     * This function handles the receipt generation and updates the BPA application details
     * with the generated receipt's file store ID.
     */
    async function getRecieptSearch({ tenantId, payments, ...params }) {
      let application = bpaApplicationDetail[0] || {};
      let fileStoreId = application?.paymentReceiptFilestoreId
      if (!fileStoreId) {
        let response = { filestoreIds: [payments?.fileStoreId] };
        response = await Digit.PaymentService.generatePdf(tenantId, { Payments: [{ ...payments }] }, "bpa-services-receipt");
        const updatedApplication = {
          ...application,
          paymentReceiptFilestoreId: response?.filestoreIds[0]
        };
        await mutation.mutateAsync({
          BPA: [updatedApplication]
        });
        fileStoreId = response?.filestoreIds[0];
        refetch();
      }
      const fileStore = await Digit.PaymentService.printReciept(tenantId, { fileStoreIds: fileStoreId });
      window.open(fileStore[fileStoreId], "_blank");
    }
  
    let dowloadOptions = [];
    dowloadOptions.push({
      label: t("BPA_DOWNLOAD_ACKNOWLEDGEMENT"),
      onClick: () => getAcknowledgementData(),
    });
   const Heading = (props) => {
     return <h1 className="heading-m">{props.label}</h1>;
   };
   
   const CloseBtn = (props) => {
     return (
       <div className="icon-bg-secondary" onClick={props.onClick}>
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FFFFFF">
             <path d="M0 0h24v24H0V0z" fill="none" />
             <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
           </svg>
         
       </div>
     );
   };
    // const getAcknowledgementData = async () => {
    //   const applications = application || {};
    //   const tenantInfo = tenants.find((tenant) => tenant.code === applications.tenantId);
    //   const acknowldgementDataAPI = await getBPAAcknowledgementData({ ...applications }, tenantInfo, t);
    //   Digit.Utils.pdf.generate(acknowldgementDataAPI);
    // };
    function addComment(e) {
    setActionError(null);
    setComments(e.target.value);
  }
  function selectfile(e) {
    setFile(e.target.files[0]);
  }
  
    function onActionSelect(action) {
    setSelectedAction(action);
    switch (action) {
      case "NEWRTP":
        setPopup(true);
        setDisplayMenu(false);
        break;
      default:
        setDisplayMenu(false);
    }
  }

    if (isLoading) {
      return <Loader />;
    }
  
    if (reciept_data && reciept_data?.Payments.length > 0 && recieptDataLoading == false) {
      dowloadOptions.push({
        label: t("BPA_FEE_RECEIPT"),
        onClick: () => getRecieptSearch({ tenantId: reciept_data?.Payments[0]?.tenantId, payments: reciept_data?.Payments[0] }),
      });
    }
  
    return (
      <React.Fragment>
        <div>
          <div className="cardHeaderWithOptions" style={{ marginRight: "auto", maxWidth: "960px" }}>
            <Header styles={{ fontSize: "32px" }}>{t("BPA_APPLICATION_DETAILS")}</Header>
            {dowloadOptions && dowloadOptions.length > 0 && (
              <MultiLink
                className="multilinkWrapper"
                onHeadClick={() => setShowOptions(!showOptions)}
                displayOptions={showOptions}
                options={dowloadOptions}
              />
            )}
          </div>
          <Card>
            <StatusTable>
              <Row className="border-none" label={t("BPA_APPLICATION_NO")} text={bpa_details?.applicationNo || t("CS_NA")} />
            </StatusTable>
  
            <CardSubHeader style={{ fontSize: "24px" }}>{t("BPA_APPLICANT_DETAILS")}</CardSubHeader>
            <StatusTable>
              <Row
                label={t("BPA_APPLICANT_NAME")}
                text={bpa_details?.applicant?.applicantName || t("CS_NA")}
              />
              <Row
                label={t("BPA_MOBILE_NO")}
                text={bpa_details?.applicant?.mobileNumber || t("CS_NA")}
              />
              <Row
                label={t("BPA_ALT_MOBILE_NO")}
                text={bpa_details?.applicant?.alternateNumber || t("CS_NA")}
              />
              <Row
                label={t("BPA_EMAIL_ID")}
                text={bpa_details?.applicant?.emailId || t("CS_NA")}
              />
              <Row
                label={t("BPA_FATHER_NAME")}
                text={bpa_details?.applicant?.fatherName || t("CS_NA")}
              />
              <Row
                label={t("BPA_MOTHER_NAME")}
                text={bpa_details?.applicant?.motherName || t("CS_NA")}
              />
              <Row
                label={t("BPA_PAN_CARD")}
                text={bpa_details?.applicant?.panCardNumber || t("CS_NA")}
              />
              <Row
                label={t("BPA_AADHAAR_CARD")}
                text={bpa_details?.applicant?.aadhaarNumber || t("CS_NA")}
              />
            </StatusTable>
  
            <CardSubHeader style={{ fontSize: "24px" }}>{t("BPA_ADDRESS_DETAILS")}</CardSubHeader>
            <CardSubHeader style={{ fontSize: "20px" }}>{t("BPA_PERMANENT_ADDRESS")}</CardSubHeader>
            <StatusTable>
              <Row
                label={t("BPA_HOUSE_NO")}
                text={bpa_details?.address?.permanent?.houseNo || t("CS_NA")}
              />
              <Row
                label={t("BPA_ADDRESS_LINE_1")}
                text={bpa_details?.address?.permanent?.addressLine1 || t("CS_NA")}
              />
              <Row
                label={t("BPA_ADDRESS_LINE_2")}
                text={bpa_details?.address?.permanent?.addressLine2 || t("CS_NA")}
              />
              <Row
                label={t("BPA_LANDMARK")}
                text={bpa_details?.address?.permanent?.landmark || t("CS_NA")}
              />
              <Row
                label={t("BPA_DISTRICT")}
                text={bpa_details?.address?.permanent?.district?.name || t("CS_NA")}
              />
              <Row
                label={t("BPA_CITY")}
                text={bpa_details?.address?.permanent?.city?.name || t("CS_NA")}
              />
              <Row
                label={t("BPA_STATE")}
                text={bpa_details?.address?.permanent?.state?.name || t("CS_NA")}
              />
              <Row
                label={t("BPA_PIN_CODE")}
                text={bpa_details?.address?.permanent?.pincode || t("CS_NA")}
              />
            </StatusTable>
  
            <CardSubHeader style={{ fontSize: "20px" }}>{t("BPA_CORRESPONDENCE_ADDRESS")}</CardSubHeader>
            {bpa_details?.address?.sameAsPermanent ? (
              <div style={{ marginTop: "16px" }}>
                <CheckBox
                  label={t("BPA_SAME_AS_PERMANENT")}
                  checked={true}
                  disabled={true}
                />
              </div>
            ) : (
              <StatusTable style={{ marginTop: "16px" }}>
                <Row
                  label={t("BPA_HOUSE_NO")}
                  text={bpa_details?.address?.correspondence?.houseNo || t("CS_NA")}
                />
                <Row
                  label={t("BPA_ADDRESS_LINE_1")}
                  text={bpa_details?.address?.correspondence?.addressLine1 || t("CS_NA")}
                />
                <Row
                  label={t("BPA_ADDRESS_LINE_2")}
                  text={bpa_details?.address?.correspondence?.addressLine2 || t("CS_NA")}
                />
                <Row
                  label={t("BPA_DISTRICT")}
                  text={bpa_details?.address?.correspondence?.district?.name || t("CS_NA")}
                />
                <Row
                  label={t("BPA_CITY")}
                  text={bpa_details?.address?.correspondence?.city?.name || t("CS_NA")}
                />
                <Row
                  label={t("BPA_STATE")}
                  text={bpa_details?.address?.correspondence?.state?.name || t("CS_NA")}
                />
                <Row
                  label={t("BPA_PIN_CODE")}
                  text={bpa_details?.address?.correspondence?.pincode || t("CS_NA")}
                />
              </StatusTable>
            )}
  
            <CardSubHeader style={{ fontSize: "24px" }}>{t("BPA_LAND_DETAILS")}</CardSubHeader>
            <StatusTable>
              <Row
                label={t("BPA_CONSTRUCTION_TYPE")}
                text={bpa_details?.land?.constructionType?.name || t("CS_NA")}
              />
              <Row
                label={t("BPA_AREA_AUTHORITY_MAPPING")}
                text={bpa_details?.land?.areaAuthority || t("CS_NA")}
              />
              <Row
                label={t("BPA_MOUZA")}
                text={bpa_details?.land?.mouza || t("CS_NA")}
              />
              <Row
                label={t("BPA_OLD_DAG_NUMBER")}
                text={bpa_details?.land?.oldDagNumber || t("CS_NA")}
              />
              <Row
                label={t("BPA_NEW_DAG_NUMBER")}
                text={bpa_details?.land?.newDagNumber || t("CS_NA")}
              />
              <Row
                label={t("BPA_OLD_PATTA_NUMBER")}
                text={bpa_details?.land?.oldPattaNumber || t("CS_NA")}
              />
              <Row
                label={t("BPA_NEW_PATTA_NUMBER")}
                text={bpa_details?.land?.newPattaNumber || t("CS_NA")}
              />
              <Row
                label={t("BPA_TOTAL_PLOT_AREA")}
                text={bpa_details?.land?.totalPlotArea ? `${bpa_details.land.totalPlotArea} sq. ft.` : t("CS_NA")}
              />
            </StatusTable>
  
            <CardSubHeader style={{ fontSize: "20px" }}>{t("BPA_ADJOINING_LAND_OWNERS")}</CardSubHeader>
            <StatusTable>
              <Row
                label={t("BPA_NORTH")}
                text={bpa_details?.land?.adjoiningOwners?.north || t("CS_NA")}
              />
              <Row
                label={t("BPA_SOUTH")}
                text={bpa_details?.land?.adjoiningOwners?.south || t("CS_NA")}
              />
              <Row
                label={t("BPA_EAST")}
                text={bpa_details?.land?.adjoiningOwners?.east || t("CS_NA")}
              />
              <Row
                label={t("BPA_WEST")}
                text={bpa_details?.land?.adjoiningOwners?.west || t("CS_NA")}
              />
            </StatusTable>
  
            <CardSubHeader style={{ fontSize: "20px" }}>{t("BPA_FUTURE_PROVISIONS")}</CardSubHeader>
            <StatusTable>
              <Row
                label={t("BPA_VERTICAL_EXTENSION")}
                text={bpa_details?.land?.futureProvisions?.verticalExtension?.name || t("CS_NA")}
              />
              <Row
                label={t("BPA_HORIZONTAL_EXTENSION")}
                text={bpa_details?.land?.futureProvisions?.horizontalExtension?.name || t("CS_NA")}
              />
            </StatusTable>
  
            <StatusTable style={{ marginTop: "16px" }}>
              <Row
                label={t("BPA_RTP_CATEGORY")}
                text={bpa_details?.land?.rtpCategory?.name || t("CS_NA")}
              />
              <Row
                label={t("BPA_REGISTERED_TECHNICAL_PERSON")}
                text={bpa_details?.land?.registeredTechnicalPerson?.name || t("CS_NA")}
              />
              <Row
                label={t("BPA_OCCUPANCY_TYPE")}
                text={bpa_details?.land?.occupancyType?.name || t("CS_NA")}
              />
              <Row
                label={t("BPA_TOD_BENEFITS")}
                text={bpa_details?.land?.todBenefits ? t("CS_YES") + ", " + t("BPA_WITH_TDR") : t("CS_NA")}
              />
              <Row
                label={t("BPA_FORM_36")}
                text={bpa_details?.land?.documents?.some(doc => doc.documentType === "FORM_36") ? t("BPA_FILE_UPLOADED") : t("CS_NA")}
              />
              <Row
                label={t("BPA_FORM_39")}
                text={bpa_details?.land?.documents?.some(doc => doc.documentType === "FORM_39") ? t("BPA_FILE_UPLOADED") : t("CS_NA")}
              />
              <Row
                label={t("BPA_TOD_ZONE")}
                text={bpa_details?.land?.todZone?.name || t("CS_NA")}
              />
            </StatusTable>
            {popup ? (
               <Modal
      headerBarMain={
        <Heading
          label={
             t("NEW_RTP")
          }
        />
      }
      headerBarEnd={<CloseBtn onClick={() => close(popup)} />}
      actionCancelLabel={t("CS_COMMON_CANCEL")}
      actionCancelOnSubmit={() => close(popup)}
      actionSaveLabel={
         t("CS_COMMON_CONFIRM")
      }
      actionSaveOnSubmit={() => {
        if(!comments)
        setActionError(t("CS_MANDATORY_REASON"));
      if(!oldRTPName)
        setActionError(t("CS_OLD_RTP_NAME_MANDATORY"))
      if(!newRTPName)
        setActionError(t("CS_NEW_RTP_NAME_MANDATORY"))
        // if(selectedAction === "REJECT" && !comments)
        // setError(t("CS_MANDATORY_COMMENTS"));
        // else
        // onAssign(selectedEmployee, comments, uploadedFile);
      }}
      error={actioneError}
      setError={setActionError}
    >
      <Card>
        
          <React.Fragment>
            <CardLabel>{t("OLD_RTP_NAME")}</CardLabel>
            { <TextInput  t={t} type="text" value={oldRTPName} onChange={(e) => setOldRTPName(e.target.value.replace(/[^a-zA-Z\s]/g, ""))} ValidationRequired={true}{...{ pattern: "^[a-zA-Z ]+$", title: t("BPA_NAME_ERROR_MESSAGE") }} />}
              <CardLabel>{t("NEW_RTP_NAME")}</CardLabel>
            { <TextInput  t={t} type="text" value={newRTPName} onChange={(e) => setNewRTPName(e.target.value.replace(/[^a-zA-Z\s]/g, ""))} ValidationRequired={true}{...{ pattern: "^[a-zA-Z ]+$", title: t("BPA_NAME_ERROR_MESSAGE") }} />}
          </React.Fragment>
        <CardLabel>{t("REASON_FOR_CHANGING_PREVIOUS_RTP")}</CardLabel>
        <TextArea name="reason" onChange={addComment} value={comments} maxLength={500}/>
        <div style={{ textAlign: "right", fontSize: "12px", color: "#666" }}>
          {comments.length}/500
        </div>
        <CardLabel>{t("CS_ACTION_SUPPORTING_DOCUMENTS")}</CardLabel>
        <CardLabelDesc>{t(`CS_UPLOAD_RESTRICTIONS`)}</CardLabelDesc>
        <UploadFile
          id={"pgr-doc"}
          accept=".jpg"
          onUpload={selectfile}
          onDelete={() => {
            setUploadedFile(null);
          }}
          message={uploadedFile ? `1 ${t(`CS_ACTION_FILEUPLOADED`)}` : t(`CS_ACTION_NO_FILEUPLOADED`)}
        />
      </Card>
    </Modal>
            ):null}
  
            {/* <WFApplicationTimeline application={application} id={application?.applicationNo} userType={"citizen"} /> */}
            {showToast && (
              <Toast
                error={showToast.key}
                label={t(showToast.label)}
                style={{ bottom: "0px" }}
                onClose={() => {
                  setShowToast(null);
                }}
              />
            )}
             <ActionBar>
              <SubmitBar label={t("WF_NEW_RTP")} onSubmit={() => onActionSelect("NEWRTP")} />
            </ActionBar>
          </Card>
        </div>
      </React.Fragment>
    );
  };
  
  export default BPAApplicationDetails;