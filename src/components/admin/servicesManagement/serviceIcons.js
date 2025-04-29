import {
  faClinicMedical,
  faUserMd,
  faPills,
  faHeartbeat,
  faNotesMedical,
  faHospital,
  faAmbulance,
  faBrain,
  faEye,
  faTooth,
  faBone,
  faLungs,
  faXRay,
  faStethoscope,
  faProcedures,
  faVial,
  faSyringe,
  faHands,
  faWheelchair,
  faDna,
  faAllergies,
  faFileMedical,
  faMedkit,
  faBandAid,
} from "@fortawesome/free-solid-svg-icons";

const availableIcons = [
  { name: "عيادة طبية", value: "faClinicMedical", icon: faClinicMedical },
  { name: "طبيب", value: "faUserMd", icon: faUserMd },
  { name: "أدوية", value: "faPills", icon: faPills },
  { name: "قلب", value: "faHeartbeat", icon: faHeartbeat },
  { name: "ملاحظات طبية", value: "faNotesMedical", icon: faNotesMedical },
  { name: "مستشفى", value: "faHospital", icon: faHospital },
  { name: "إسعاف", value: "faAmbulance", icon: faAmbulance },
  { name: "دماغ", value: "faBrain", icon: faBrain },
  { name: "عين", value: "faEye", icon: faEye },
  { name: "أسنان", value: "faTooth", icon: faTooth },
  { name: "عظام", value: "faBone", icon: faBone },
  { name: "رئتين", value: "faLungs", icon: faLungs },
  { name: "أشعة", value: "faXRay", icon: faXRay },
  { name: "سماعة طبيب", value: "faStethoscope", icon: faStethoscope },
  { name: "إجراءات", value: "faProcedures", icon: faProcedures },
  { name: "اختبار", value: "faVial", icon: faVial },
  { name: "حقنة", value: "faSyringe", icon: faSyringe },
  { name: "رعاية", value: "faHands", icon: faHands },
  { name: "كرسي متحرك", value: "faWheelchair", icon: faWheelchair },
  { name: "الحمض النووي", value: "faDna", icon: faDna },
  { name: "حساسية", value: "faAllergies", icon: faAllergies },
  { name: "ملف طبي", value: "faFileMedical", icon: faFileMedical },
  { name: "عدة إسعافات", value: "faMedkit", icon: faMedkit },
  { name: "ضمادة", value: "faBandAid", icon: faBandAid },
];

export default availableIcons;

export const renderIcon = (iconName, availableIcons) => {
  const iconObj = availableIcons.find((icon) => icon.value === iconName);
  if (iconObj) {
    return iconObj.icon;
  }
  return null;
};
