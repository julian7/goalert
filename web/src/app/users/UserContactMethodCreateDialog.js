import React, { useState, useEffect } from 'react'
import p from 'prop-types'

import gql from 'graphql-tag'
import { fieldErrors, nonFieldErrors } from '../util/errutil'

import FormDialog from '../dialogs/FormDialog'
import UserContactMethodForm from './UserContactMethodForm'
import { useMutation } from '@apollo/react-hooks'

const createMutation = gql`
  mutation($input: CreateUserContactMethodInput!) {
    createUserContactMethod(input: $input) {
      id
    }
  }
`

export default function UserContactMethodCreateDialog(props) {
  // values for contact method form
  const [cmValue, setCmValue] = useState({
    name: '',
    type: 'SMS',
    value: '',
  })

  const [locale, setLocale] = useState({
    countryCode: 'US', // default
    countryName: 'United States',
  })

  useEffect(() => {
    async function doAsync() {
      const response = await fetch('http://ip-api.com/json')
      const json = await response.json()
      const countryName = json.country
      const countryCode = json.countryCode
      setLocale({ countryCode, countryName })
    }

    doAsync()
  }, [])

  const [createCM, createCMStatus] = useMutation(createMutation, {
    refetchQueries: ['nrList', 'cmList'],
    onCompleted: result => {
      props.onClose({ contactMethodID: result.createUserContactMethod.id })
    },
    variables: {
      input: {
        ...cmValue,
        userID: props.userID,
        newUserNotificationRule: {
          delayMinutes: 0,
        },
      },
    },
  })

  const { loading, error } = createCMStatus
  const fieldErrs = fieldErrors(error)
  const { title = 'Create New Contact Method', subtitle } = props

  const form = (
    <UserContactMethodForm
      disabled={loading}
      errors={fieldErrs}
      onChange={cmValue => setCmValue(cmValue)}
      value={cmValue}
      countryCode={locale.countryCode}
      disclaimer={props.disclaimer}
    />
  )
  return (
    <FormDialog
      data-cy='create-form'
      title={title}
      subTitle={subtitle}
      loading={loading}
      errors={nonFieldErrors(error)}
      onClose={props.onClose}
      // wrapped to prevent event from passing into createCM
      onSubmit={() => createCM()}
      form={form}
    />
  )
}

UserContactMethodCreateDialog.propTypes = {
  userID: p.string.isRequired,
  onClose: p.func,
  disclaimer: p.string,
  title: p.string,
  subtitle: p.string,
}
