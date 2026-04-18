import { useRef } from "react";
import { useNavigate, Route } from 'react-router-dom';
import { Formik, Form } from "formik";
import { motion, AnimatePresence } from "framer-motion";

import { handleDelay, handleOptionalProp, handleCurrentValues, handleValidation, handleData } from "utils/handlers";

import useWizard, { WizardProvider } from "context/wizardContext";
import WizardStep from "components/renderers/WizardStep";
import WizardButtons from "components/renderers/WizardButtons";

import FormContainer from "components/containers/FormContainer";

export const WizardRenderer = () => {
    const navigate = useNavigate();
    const { struct, schemas, getFormData, setFields, currIndex, nextStep, ADELANTE, direction, length } = useWizard();

    const lastIndexRef = useRef(null);
    const initialValuesRef = useRef(null);
    if (lastIndexRef.current !== currIndex) {
        initialValuesRef.current = handleCurrentValues(
            getFormData(),
            struct.steps[currIndex]
        );
        lastIndexRef.current = currIndex;
    }
    const initialValues = initialValuesRef.current;
    if (!initialValues || Object.values(initialValues).some((v) => v === undefined)) return null;

    // console.log("FORMDATA:",getFormData());
    // console.log("SCHEMAS:",schemas[currIndex].shape)

    // console.log("-----------------------");
    // console.log("INITIALVALUES",initialValues);

    // esto es para la animacion nada mas
    const duration = 0.15;
    const variants = {
        enter: (dir) => ({ x: dir === ADELANTE ? 100 : -100, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (dir) => ({ x: dir === ADELANTE ? -100 : 100, opacity: 0 }),
    };

    return (
        <FormContainer>
            {
                // currIndex !== 0 && <PrevStepBtn onClick={prevStep} />
            }

            <Formik
                initialValues={initialValues}
                enableReinitialize={true}
                validate={(values) => handleValidation(values, schemas[currIndex], struct.steps[currIndex])}
                validationOnBlur={true}
                onSubmit={async (values, formikHelpers) => {
                    setFields(values);
                    formikHelpers.setStatus(undefined);
                    
                    // console.log("FORMDATA:",getFormData());

                    await handleDelay(500);
                    if (currIndex === (struct.steps?.length - 1)) {
                        await struct.onSubmit({
                            formData:handleData(getFormData()),
                            navigate,
                            ...formikHelpers,
                        });
                    } else {
                        nextStep();
                        // setSubmitting(false);
                    }
                }}
            >
                    <Form>
                        <AnimatePresence
                            mode="wait"
                            custom={direction}
                        >
                            <motion.div
                                key={currIndex}
                                custom={direction}
                                variants={variants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration }}
                                className="d-flex fit-flex justify-content-center"
                            >
                                <WizardStep />
                            </motion.div>
                        </AnimatePresence>
                        <WizardButtons
                            index={currIndex}
                            length={length}
                            topButtons={struct.steps[currIndex].topButtons ?? []}
                            bottomButtons={struct.steps[currIndex].bottomButtons ?? []}
                            {...handleOptionalProp("submitText", struct.submitButtonText)}
                            {...handleOptionalProp("continueText", struct.steps[currIndex].continueButtonText)}
                            {...handleOptionalProp("backText", struct.steps[currIndex].backButtonText)}
                        />
                    </Form>
            </Formik>
        </FormContainer>
    );
};

export const WizardRouter = (struct) => (
    <Route
        element={
            <WizardProvider key={struct.id} struct={struct} >
                <WizardRenderer />
            </WizardProvider>
        }
    >
        {struct.steps.map((step, i) => (
            <Route key={i} path={step.path} element={<div />} />
        ))}
    </Route>
);