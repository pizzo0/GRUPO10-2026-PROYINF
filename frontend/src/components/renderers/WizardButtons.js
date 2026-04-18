import { memo } from "react";
import { useNavigate } from 'react-router-dom';
import { useFormikContext } from "formik";

import { ArrowRight, ArrowLeft } from 'lucide-react';

import useWizard from "context/wizardContext";

import BtnsContainer from "components/containers/BtnsContainer";
import Span from "components/Span";

const WizardButtons = memo(({index, length, submitText, continueText, backText, topButtons = [], bottomButtons = []}) => {
    const navigate = useNavigate();
    const { prevStep } = useWizard();
    const { isSubmitting } = useFormikContext();

    // console.log("RENDERIZANDO BOTONES");

    const ContinueButton = {
        text: continueText ?? (
            <Span>
                Continuar
                <ArrowRight size={"1rem"} />
            </Span>
        ),
        type: "submit",
    };
    const BackButton = {
        text: backText ?? (
            <Span>
                <ArrowLeft size={"1rem"} />
                Volver
            </Span>
        ),
        type: "button",
        onClick: prevStep,
        className: "btn btn-secondary btn-opacity-25",
    };
    const SubmitButton = {
        text: submitText ?? (
            <Span>
                Enviar
            </Span>
        ),
        type: "submit",
    };

    let buttons = [...topButtons];
    if (index === length - 1) {
        buttons.push(SubmitButton);
        if (length !== 1 ) buttons.push(BackButton);
    } else if (index === 0) {
        buttons.push(ContinueButton);
    } else {
        buttons.push(ContinueButton);
        buttons.push(BackButton);
    }
    buttons = [...buttons, ...bottomButtons];

    return (
        <BtnsContainer>
            { buttons.map((data, index) => {
                let cn = data.className ?? "btn btn-primary";
                if (buttons.length > 1 && index === 0) cn += " btn-top";
                else if (buttons.length > 1 && index === buttons.length - 1) cn += " btn-bottom";

                const isDisabled = (data.type === "submit" && isSubmitting);

                return (
                    <button
                        key={index}
                        type={data.type ?? "button"}
                        className={`position-relative ${cn}`}
                        onClick={(e) => {
                            data.onClick?.({ e, navigate })
                        }}
                        disabled={isDisabled}
                    >
                        <span style={{ opacity: isDisabled ? 0 : 1 }}>
                            {data.text ?? "Button"}
                        </span>
                        {isDisabled && (
                            <div
                                className="d-flex position-absolute"
                            >
                                <div
                                    className="spinner-border spinner-border-sm"
                                    style={{ width: "1.5rem", height: "1.5rem" }}
                                    role="status"
                                >
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        )}
                    </button>
                )
            }) }
        </BtnsContainer>
    );
});

export default WizardButtons;