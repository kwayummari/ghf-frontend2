import React from 'react';
import {
    Box,
    Stepper,
    Step,
    StepLabel,
    StepContent,
    Typography,
    Paper,
    Chip
} from '@mui/material';
import {
    CheckCircle as CheckIcon,
    RadioButtonUnchecked as PendingIcon,
    Cancel as RejectIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

const WorkflowTracker = ({ workflowSteps, orientation = 'horizontal' }) => {
    if (!workflowSteps || workflowSteps.length === 0) {
        return (
            <Paper sx={{ p: 2, border: '1px solid rgba(194, 137, 90, 0.2)' }}>
                <Typography variant="body2" sx={{ color: '#4F78AE' }}>
                    No workflow information available
                </Typography>
            </Paper>
        );
    }

    const getStepIcon = (status) => {
        switch (status) {
            case 'approved':
                return <CheckIcon sx={{ color: '#4F78AE' }} />;
            case 'rejected':
                return <RejectIcon sx={{ color: '#C2895A' }} />;
            case 'pending':
                return <PendingIcon sx={{ color: '#C2895A' }} />;
            default:
                return <PendingIcon sx={{ color: '#C2895A' }} />;
        }
    };

    const getStepStatus = (status) => {
        switch (status) {
            case 'approved':
                return { label: 'Approved', color: '#4F78AE' };
            case 'rejected':
                return { label: 'Rejected', color: '#C2895A' };
            case 'pending':
                return { label: 'Pending', color: '#C2895A' };
            default:
                return { label: 'Waiting', color: '#C2895A' };
        }
    };

    const activeStep = workflowSteps.findIndex(step => step.status === 'pending');
    const currentStep = activeStep === -1 ? workflowSteps.length : activeStep;

    return (
        <Paper sx={{ p: 2, border: '1px solid rgba(194, 137, 90, 0.2)' }}>
            <Typography variant="h6" sx={{ color: '#4F78AE', mb: 2 }}>
                Approval Workflow
            </Typography>

            <Stepper
                activeStep={currentStep}
                orientation={orientation}
                sx={{
                    '& .MuiStepLabel-root .Mui-completed': {
                        color: '#4F78AE'
                    },
                    '& .MuiStepLabel-root .Mui-active': {
                        color: '#C2895A'
                    }
                }}
            >
                {workflowSteps.map((step, index) => {
                    const stepStatus = getStepStatus(step.status);

                    return (
                        <Step key={step.id}>
                            <StepLabel icon={getStepIcon(step.status)}>
                                <Box>
                                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#000000' }}>
                                        {step.step_name}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                        <Chip
                                            label={stepStatus.label}
                                            size="small"
                                            sx={{
                                                backgroundColor: stepStatus.color,
                                                color: '#ffffff',
                                                fontSize: '0.75rem',
                                                height: 20
                                            }}
                                        />
                                        {step.requiredRole && (
                                            <Typography variant="caption" sx={{ color: '#4F78AE' }}>
                                                {step.requiredRole.role_name}
                                            </Typography>
                                        )}
                                    </Box>
                                    {step.processor && (
                                        <Typography variant="caption" sx={{ color: '#000000', display: 'block', mt: 0.5 }}>
                                            By: {step.processor.first_name} {step.processor.sur_name}
                                            <br />
                                            {format(new Date(step.processed_at), 'MMM dd, yyyy HH:mm')}
                                        </Typography>
                                    )}
                                    {step.comments && (
                                        <Typography variant="caption" sx={{ color: '#4F78AE', fontStyle: 'italic', display: 'block', mt: 0.5 }}>
                                            "{step.comments}"
                                        </Typography>
                                    )}
                                </Box>
                            </StepLabel>
                            {orientation === 'vertical' && (
                                <StepContent>
                                    <Typography variant="body2" sx={{ color: '#4F78AE' }}>
                                        Role: {step.requiredRole?.role_name}
                                    </Typography>
                                </StepContent>
                            )}
                        </Step>
                    );
                })}
            </Stepper>
        </Paper>
    );
};

export default WorkflowTracker;