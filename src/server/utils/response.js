const statusCodes = {
    SUCCESS: 0,
    ERROR: -1
};

const errorMessages = {
    INVALID_REQUEST: 'There was a problem with your request.',
    MISSING_OR_INVALID_PARAMETERS: 'There was a problem with your request.',
    LIMIT_EXCEEDED: 'You have made too many requests recently. Please try again later.',
    INVALID_CREDENTIALS: 'User entered invalid credentials.',
    REGISTRATION_FAILED: 'Failed to create user.',
    LOGIN_FAILED: 'Failed to authenticate user.',
    PROCESS_FAILED: 'There was an error processing your request.',
    UNSUPPORTED_METHOD: 'Method unsupported.',
    DUPLICATE_ENTRY: 'The item you are trying to add is already in the collection.',
    MISSING_ENTRY: 'The item you are trying to remove is not part of the collection.'
};

function buildSuccessResponse(data = {}) {
    return JSON.stringify({
        statusCode: statusCodes.SUCCESS,
        responseData: data
    });
}

function buildErrorResponse(msg = errorMessages.PROCESS_FAILED) {
    return JSON.stringify({
        statusCode: statusCodes.ERROR,
        errorMsg: msg
    });
}

module.exports = {
    errMsg: errorMessages,
    reqSuccess: buildSuccessResponse,
    reqError: buildErrorResponse
};