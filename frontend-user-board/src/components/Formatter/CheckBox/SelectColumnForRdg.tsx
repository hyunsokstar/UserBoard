import { Column } from "react-data-grid";
import CheckBoxFormatterForHeader from "./CheckBoxFormatterForHeader";
import CheckBoxFormatterForRow from "./CheckBoxFormatterForRow";

export const SelectColumnForRdg: Column<any, any> = {
  key: "select-row",
  name: '',
  width: 35,
  minWidth: 35,
  maxWidth: 35,
  resizable: false,
  sortable: false,
  frozen: true,
  renderHeaderCell(props) {
    return <CheckBoxFormatterForHeader {...props} />;
  },
  renderCell(props) {
    return <CheckBoxFormatterForRow {...props} />;
  },
};