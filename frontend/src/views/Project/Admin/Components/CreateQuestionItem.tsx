import React, { useState } from 'react'
import { MarkdownEditor, SearchableDropdown } from '@equinor/fusion-components'
import { TextField, Typography } from '@equinor/eds-core-react'
import { Box, Grid } from '@material-ui/core'
import { ApolloError } from '@apollo/client'

import { Barrier, Organization, QuestionTemplate } from '../../../../api/models'
import { ErrorIcon, TextFieldChangeEvent } from '../../../../components/Action/utils'
import { getOrganizationOptionsForDropdown } from '../../../helpers'
import { useEffectNotOnMount, useValidityCheck } from '../../../../utils/hooks'
import { DataToCreateQuestionTemplate } from '../AdminView'
import CancelAndSaveButton from '../../../../components/CancelAndSaveButton'
import ErrorBanner from '../../../../components/ErrorBanner'
import { genericErrorMessage } from '../../../../utils/Variables'

interface Props {
    barrier: Barrier
    setIsInAddMode: (isAddingQuestion: boolean) => void
    createQuestionTemplate: (data: DataToCreateQuestionTemplate) => void
    isSaving: boolean
    saveError: ApolloError | undefined
    selectedProjectCategory?: string
    questionTemplateToCopy?: QuestionTemplate
}

const CreateQuestionItem = ({
    setIsInAddMode,
    barrier,
    createQuestionTemplate,
    isSaving,
    saveError,
    selectedProjectCategory,
    questionTemplateToCopy,
}: Props) => {
    const [text, setText] = React.useState<string>(questionTemplateToCopy?.text || '')
    const [organization, setOrganization] = React.useState<Organization>(questionTemplateToCopy?.organization || Organization.All)
    const [supportNotes, setSupportNotes] = React.useState<string>(questionTemplateToCopy?.supportNotes || '')
    const [showErrorMessage, setShowErrorMessage] = useState<boolean>(false)

    useEffectNotOnMount(() => {
        if (saveError !== undefined) {
            setShowErrorMessage(true)
        }
    }, [saveError])

    const isTextfieldValid = () => {
        return text.length > 0
    }

    const { valueValidity } = useValidityCheck<string>(text, isTextfieldValid)

    const assignProjectCategories = () => {
        if (questionTemplateToCopy) {
            return questionTemplateToCopy.projectCategories.map(pc => {
                return pc.id
            })
        } else if (selectedProjectCategory && selectedProjectCategory !== 'all') {
            return [selectedProjectCategory]
        }
        return []
    }

    const createQuestion = () => {
        const newQuestion: DataToCreateQuestionTemplate = {
            barrier,
            organization,
            text,
            supportNotes,
            projectCategoryIds: assignProjectCategories(),
            newOrder: questionTemplateToCopy ? questionTemplateToCopy.order + 1 : 0,
        }
        createQuestionTemplate(newQuestion)
    }

    const onCancelCreate = () => {
        setIsInAddMode(false)
        setShowErrorMessage(false)
    }

    return (
        <Box display="flex" flexDirection="column">
            {showErrorMessage && (
                <Box mb={2} ml={4}>
                    <ErrorBanner
                        message={'Could not save question template. ' + genericErrorMessage}
                        onClose={() => setShowErrorMessage(false)}
                    />
                </Box>
            )}
            {questionTemplateToCopy && (
                <Box ml={2} mr={1} mt={1} mb={3}>
                    <Typography variant="h4">Copy question: "{questionTemplateToCopy.text}"</Typography>
                </Box>
            )}
            <Box display="flex" flexDirection="row">
                <Box display="flex" flexGrow={1} flexDirection={'column'} mt={0.75}>
                    <Box display="flex" ml={4} mr={2}>
                        <TextField
                            data-testid="question-title-textfield"
                            id={'title'}
                            value={text}
                            autoFocus={true}
                            label="Question"
                            onChange={(event: TextFieldChangeEvent) => {
                                setText(event.target.value)
                            }}
                            variant={valueValidity}
                            helperText={valueValidity === 'error' ? 'required' : ''}
                            helperIcon={valueValidity === 'error' ? ErrorIcon : <></>}
                            multiline
                        />
                    </Box>
                    <Box ml={3} mt={3} mr={1} mb={10}>
                        <MarkdownEditor
                            data-testid="markdown-editor"
                            onChange={markdown => setSupportNotes(markdown)}
                            menuItems={['strong', 'em', 'bullet_list', 'ordered_list', 'blockquote', 'h1', 'h2', 'h3', 'paragraph']}
                        >
                            {supportNotes === '' ? ' ' : supportNotes}
                        </MarkdownEditor>
                    </Box>
                </Box>
                <Box display="flex" flexDirection={'column'}>
                    <Box flexGrow={1} data-testid="select-organization-dropdown-box" mt={3}>
                        <SearchableDropdown
                            label="Organization"
                            options={getOrganizationOptionsForDropdown(organization)}
                            onSelect={option => setOrganization(option.key as Organization)}
                        />
                    </Box>
                    <CancelAndSaveButton
                        onClickCancel={onCancelCreate}
                        onClickSave={createQuestion}
                        isSaving={isSaving}
                        cancelButtonTestId="cancel-edit-question"
                        saveButtonTestId="save-question-button"
                        disableCancelButton={isSaving}
                        disableSaveButton={isSaving || !isTextfieldValid()}
                    />
                </Box>
            </Box>
        </Box>
    )
}

export default CreateQuestionItem
