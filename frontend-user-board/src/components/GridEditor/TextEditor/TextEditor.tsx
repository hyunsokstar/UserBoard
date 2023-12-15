// TextEditor.tsx 파일
import React, { useState } from 'react';
import gridStyles from './styles.module.scss';

interface TextEditorProps<TRow, TSummaryRow> {
    row: TRow;
    column: { key: string };
    onRowChange: (updatedRow: TRow) => void;
    onClose: (commit: boolean, keepEditing: boolean) => void;
}

const TextEditor = <TRow, TSummaryRow>({
    row,
    column,
    onRowChange,
    onClose,
}: TextEditorProps<TRow, TSummaryRow>) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <input
            value={row[column.key as keyof TRow] as unknown as string}
            onChange={(event) => onRowChange({ ...row, [column.key]: event.target.value })}
            onBlur={(e) => {
                console.log("이전값 : ", typeof row[column.key as keyof TRow], row[column.key as keyof TRow]);
                console.log("e : ", typeof parseInt(e.target.value), parseInt(e.target.value));

                const currentValue = parseFloat(e.target.value) || 0;

                if (previousValue !== currentValue) {
                    onRowSelectionChange({ type: "ROW", row: row, checked: true, isShiftClick: false });
                }
                onClose(true, false)
            }
            } className={gridStyles.inputStyle} // styles 객체에서 해당 클래스를 가져와서 적용
        />
    );
};

export default TextEditor;