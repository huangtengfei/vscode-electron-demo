const HANDSHAKE_TYPE = '$$handshake';

const handshakePack = (payload) => ({
  type: HANDSHAKE_TYPE,
  payload
});

const reqPack = (type, payload) => ({
  type, payload
});

const resPack = (payload) => {
  if (payload instanceof Error) {
    return {
      success: false,
      errorMessage: payload.message
    }
  } else {
    return {
      success: true,
      data: payload
    }
  }
};

module.exports = {
  HANDSHAKE_TYPE, handshakePack, reqPack, resPack
}
