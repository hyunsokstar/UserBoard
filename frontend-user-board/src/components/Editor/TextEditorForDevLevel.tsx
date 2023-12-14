// TextEditorForDevLevel.tsx 파일
import React, { useState } from 'react';
import gridStyles from './styles.module.scss';
import { NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper } from '@chakra-ui/react';
import { useRowSelection } from 'react-data-grid';

interface TextEditorForDevLevelProps<TRow, TSummaryRow> {
    row: TRow;
    column: { key: string };
    onRowChange: (updatedRow: TRow) => void;
    onClose: (commit: boolean, keepEditing: boolean) => void;
}

const TextEditorForDevLevel = <TRow, TSummaryRow>({
    row,
    column,
    onRowChange,
    onClose,
}: TextEditorForDevLevelProps<TRow, TSummaryRow>) => {

    const [isRowSelected, onRowSelectionChange] = useRowSelection();
    const [previousValue, setPreviousValue] = useState(row[column.key as keyof TRow] as unknown as number);

    // 해당 행의 체크박스를 체크하는 함수
    // const checkRowCheckbox = () => {
    //     // useRowSelection 훅을 통해 해당 행의 선택 여부를 관리합니다.
    //     onRowSelectionChange({ row:row checked: true, isShiftClick: false });
    // };

    console.log("fucking 여기 text editor for dev level");

    return (
        <NumberInput
            value={row[column.key as keyof TRow] as unknown as number}
            onChange={(valueString) => {
                const value = parseFloat(valueString) || 0;
                onRowChange({ ...row, [column.key]: value });
                // 해당 행의 체크 박스를 체크하는 함수 호출
                console.log("여기 맞아?");
            }}

            onBlur={(e) => {
                console.log("이전값 : ", typeof row[column.key as keyof TRow], row[column.key as keyof TRow]);
                console.log("e : ", typeof parseInt(e.target.value), parseInt(e.target.value));

                const currentValue = parseFloat(e.target.value) || 0;

                if (previousValue !== currentValue) {
                    onRowSelectionChange({ type: "ROW", row: row, checked: true, isShiftClick: false });
                }
                onClose(true, false)
            }
            }
            height={"100%"}
        >
            <NumberInputField height="auto" my={1} />
            <NumberInputStepper>
                <NumberIncrementStepper height="18px" width="24px" />
                <NumberDecrementStepper height="18px" width="24px" />
            </NumberInputStepper>
        </NumberInput>
    );
};

export default TextEditorForDevLevel;
