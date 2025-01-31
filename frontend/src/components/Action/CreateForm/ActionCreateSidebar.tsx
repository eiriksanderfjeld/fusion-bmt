import React from 'react'

import { ModalSideSheet } from '@equinor/fusion-components'
import { CircularProgress } from '@equinor/eds-core-react'

import { Participant, Question } from '../../../api/models'
import ActionCreateForm from './ActionCreateForm'
import { useAllPersonDetailsAsync } from '../../../utils/hooks'
import { DataToCreateAction } from './ActionCreateSidebarWithApi'
import ErrorBanner from '../../ErrorBanner'
import { genericErrorMessage } from '../../../utils/Variables'

interface Props {
    open: boolean
    connectedQuestion: Question
    possibleAssignees: Participant[]
    onActionCreate: (action: DataToCreateAction) => void
    onClose: () => void
    disableCreate?: boolean
    creatingAction: boolean
    showErrorMessage: boolean
    setShowErrorMessage: (value: boolean) => void
}

const ActionCreateSidebar = ({
    open,
    connectedQuestion,
    possibleAssignees,
    onActionCreate,
    onClose,
    disableCreate = false,
    creatingAction,
    showErrorMessage,
    setShowErrorMessage,
}: Props) => {
    const { personDetailsList, isLoading } = useAllPersonDetailsAsync(possibleAssignees.map(assignee => assignee.azureUniqueId))

    return (
        <ModalSideSheet header={`Add Action`} show={open} size="large" onClose={onClose} isResizable={false}>
            {isLoading && (
                <div style={{ textAlign: 'center' }}>
                    <CircularProgress />
                </div>
            )}
            {!isLoading && showErrorMessage && (
                <ErrorBanner message={'Could not save action. ' + genericErrorMessage} onClose={() => setShowErrorMessage(false)} />
            )}
            {!isLoading && (
                <div style={{ margin: 20 }} data-testid="create_action_dialog_body">
                    <ActionCreateForm
                        connectedQuestion={connectedQuestion}
                        possibleAssignees={possibleAssignees}
                        possibleAssigneesDetails={personDetailsList}
                        onActionCreate={onActionCreate}
                        onCancelClick={onClose}
                        disableCreate={disableCreate}
                        creatingAction={creatingAction}
                    />
                </div>
            )}
        </ModalSideSheet>
    )
}

export default ActionCreateSidebar
