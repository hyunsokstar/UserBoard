// TextEditor.tsx 파일
import React, { useState } from 'react';
import gridStyles from './styles.module.scss';
import { useRowSelection } from 'react-data-grid';

interface TextEditorProps<TRow, TSummaryRow> {
    row: TRow;
    column: { key: string };
    onRowChange: (updatedRow: TRow) => void;
    onClose: (commit: boolean, keepEditing: boolean) => void;
}

const TextEditorForPhoneNumber = <TRow, TSummaryRow>({
    row,
    column,
    onRowChange,
    onClose,
}: TextEditorProps<TRow, TSummaryRow>) => {
    const [previousValue, setPreviousValue] = useState(row[column.key as keyof TRow] as string);
    const [isRowSelected, onRowSelectionChange] = useRowSelection();

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            console.log('엔터 눌렀습니다');
            if (row[column.key as keyof TRow] !== previousValue) {
                setPreviousValue(row[column.key as keyof TRow] as string);
                onRowSelectionChange({ type: 'ROW', row: row, checked: true, isShiftClick: false });
            }
            onClose(true, false);
        }
    };

    const onBlurHandler = () => {
        if (row[column.key as keyof TRow] !== previousValue) {
            setPreviousValue(row[column.key as keyof TRow] as string);
            onRowSelectionChange({ type: 'ROW', row: row, checked: true, isShiftClick: false });
        }
        onClose(true, false);
    };

    return (
        <input
            autoFocus
            value={row[column.key as keyof TRow] as unknown as string}
            onChange={(event) => onRowChange({ ...row, [column.key]: event.target.value })}
            onBlur={onBlurHandler} // 변경된 onBlur 함수
            onKeyDown={handleKeyPress} // 엔터 키 입력 감지
            className={gridStyles.inputStyle} // styles 객체에서 해당 클래스를 가져와서 적용
        />
    );
};

export default TextEditorForPhoneNumber;
