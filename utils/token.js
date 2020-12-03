import User from '../models/user.model';

export async function getJwtTokenById(id) {
  try {
    return await User.findOne({ telegramId: id }, { _id: 0, jwtToken: 1 }).then((user) => {
      return user.jwtToken;
    });
  } catch (err) {
    console.error(err);
  }
}
