import _ from 'lodash';
import { hasOffereds } from '../selectors/assessment';

// Leave this empty. It will hold assessments by bank id. IE `state[someId] = {a_bank}`
const initialState = {};

export default function banks(state = initialState, action) {
  switch (action.type) {

    case 'GET_ASSESSMENTS_DONE': {
      const newState = _.cloneDeep(state);
      _.forEach(action.payload, (assessment) => {
        _.forEach(assessment.assignedBankIds, (bankId) => {
          if (!newState[bankId]) {
            newState[bankId] = {};
          }
          newState[bankId][assessment.id] = assessment;
        });
      });
      return newState;
    }

    case 'UPDATE_ASSESSMENT_DONE': {
      const newState = _.cloneDeep(state);

      const bankId = action.payload.bankId;
      if (!newState[bankId]) {
        newState[bankId] = {};
      }

      // to preserve the assessmentOffered in state tree,
      // when tabbing back to N of M or editing the assessment
      let existingAssessmentOffereds = [];

      if (bankId in state &&
          action.payload.id in state[bankId] &&
          'assessmentOffered' in state[bankId][action.payload.id]) {
        existingAssessmentOffereds = state[bankId][action.payload.id].assessmentOffered;
      }

      newState[bankId][action.payload.id] = action.payload;
      newState[bankId][action.payload.id].assessmentOffered = existingAssessmentOffereds;
      return newState;
    }

    case 'EDIT_OR_PUBLISH_ASSESSMENT_DONE': {
      const newState = _.cloneDeep(state);
      const changeId = action.original.body.assignedBankIds[0];
      const bankId = action.original.bankId;
      const assessmentId = action.original.assessmentId;
      newState[bankId][assessmentId].assignedBankIds.push(changeId);
      newState[bankId][assessmentId].isToggling = false;
      return newState;
    }

    case 'EDIT_OR_PUBLISH_ASSESSMENT': {
      const newState = _.cloneDeep(state);
      const bankId = action.bankId;
      const assessmentId = action.assessmentId;
      newState[bankId][assessmentId].isToggling = true;
      return newState;
    }

    case 'DELETE_ASSIGNED_ASSESSMENT_DONE': {
      const newState = _.cloneDeep(state);
      const changeId = action.original.assignedId;
      const bankId = action.original.bankId;
      const assessmentId = action.original.assessmentId;
      const index = newState[bankId][assessmentId].assignedBankIds.indexOf(changeId);
      newState[bankId][assessmentId].assignedBankIds.splice(index, 1);
      return newState;
    }

    case 'CREATE_ASSESSMENT_DONE': {
      const newState = _.cloneDeep(state);
      const bankId = action.payload.bankId;
      if (!newState[bankId]) {
        newState[bankId] = {};
      }
      newState[bankId][action.payload.id] = action.payload;
      return newState;
    }

    case 'CREATE_ASSESSMENT_OFFERED_DONE':
    case 'GET_ASSESSMENT_OFFERED_DONE': {
      const newState = _.cloneDeep(state);
      newState[
        action.original.bankId
      ][
        action.original.assessmentId
      ].assessmentOffered = action.payload;
      return newState;
    }

    case 'UPDATE_N_OF_M_DONE': {
      const newState = _.cloneDeep(state);

      // An offered should always exist by this point
      //   ....but just in case not.
      if (hasOffereds(action, newState)) {
        newState[
          action.original.bankId
        ][
          action.original.assessmentId
        ].assessmentOffered[0].nOfM = action.payload;
      }
      return newState;
    }

    case 'UPDATE_UNLOCK_PREVIOUS_DONE': {
      const newState = _.cloneDeep(state);

      // An offered should always exist by this point
      //   ....but just in case not.
      if (hasOffereds(action, newState)) {
        newState[
          action.original.bankId
        ][
          action.original.assessmentId
        ].assessmentOffered[0].unlockPrevious = action.payload;
      }
      return newState;
    }

    case 'DELETE_ASSESSMENT_DONE': {
      const newState = _.cloneDeep(state);
      const bankId = action.original.bankId;
      delete newState[bankId][action.original.assessmentId];
      return newState;
    }

    default:
      return state;
  }
}
