import sequelize from '../config/db';

// Import model definition functions
import { defineUserModel, UserModel } from './user.model';
import { defineProfessionalModel, ProfessionalModel } from './professional.model';
import { defineScheduleModel, ScheduleModel } from './schedule.model';
import { definePaymentModel, PaymentModel } from './payment.model';
import { defineCommunityPostModel, CommunityPostModel } from './community_post.model';
import { defineCommentModel, CommentModel } from './comment.model';
import { defineLikeModel, LikeModel } from './like.model';
import { defineCategoryModel, CategoryModel } from './category.model';
import { defineAdminActionModel, AdminActionModel } from './admin_action.model';
import { defineAISuggestionModel, AISuggestionModel } from './ai_suggestion.model';

// Initialize models
const User = defineUserModel(sequelize);
const Professional = defineProfessionalModel(sequelize);
const Schedule = defineScheduleModel(sequelize);
const Payment = definePaymentModel(sequelize);
const CommunityPost = defineCommunityPostModel(sequelize);
const Comment = defineCommentModel(sequelize);
const Like = defineLikeModel(sequelize);
const Category = defineCategoryModel(sequelize);
const AdminAction = defineAdminActionModel(sequelize);
const AISuggestion = defineAISuggestionModel(sequelize);

// User ↔ Professional
User.hasOne(Professional, { foreignKey: 'id' });
Professional.belongsTo(User, { foreignKey: 'id' });

// Schedule Relations
User.hasMany(Schedule, { foreignKey: 'user_id' });
Professional.hasMany(Schedule, { foreignKey: 'professional_id' });

// Payment
User.hasMany(Payment, { foreignKey: 'user_id' });
Schedule.hasOne(Payment, { foreignKey: 'schedule_id' });
Payment.belongsTo(Schedule, { foreignKey: 'schedule_id' });
Payment.belongsTo(User, { foreignKey: 'user_id' });

// CommunityPost
User.hasMany(CommunityPost, { foreignKey: 'user_id' });
CommunityPost.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Category.hasMany(CommunityPost, { foreignKey: 'category_id' });
CommunityPost.belongsTo(Category, { foreignKey: 'category_id' });

// Comments
User.hasMany(Comment, { foreignKey: 'user_id' });
// Add the 'as' alias here
CommunityPost.hasMany(Comment, { foreignKey: 'post_id', as: 'comments' }); 
Comment.belongsTo(User, { foreignKey: 'user_id' });
Comment.belongsTo(CommunityPost, { foreignKey: 'post_id' });

// Likes
User.hasMany(Like, { foreignKey: 'user_id' });
// Add the 'as' alias here
CommunityPost.hasMany(Like, { foreignKey: 'post_id', as: 'likes' });
Like.belongsTo(User, { foreignKey: 'user_id' });
Like.belongsTo(CommunityPost, { foreignKey: 'post_id' });

// Category ↔ Professional, AISuggestion
Category.hasMany(Professional, { foreignKey: 'category_id' });
Category.hasMany(AISuggestion, { foreignKey: 'category_id' });
AISuggestion.belongsTo(Category, { foreignKey: 'category_id' });

// AdminAction
User.hasMany(AdminAction, { foreignKey: 'admin_id' });
AdminAction.belongsTo(User, { foreignKey: 'admin_id' });

// AISuggestion ↔ User
User.hasMany(AISuggestion, { foreignKey: 'user_id' });
AISuggestion.belongsTo(User, { foreignKey: 'user_id' });

Schedule.belongsTo(User, { as: 'patient', foreignKey: 'user_id' });
Schedule.belongsTo(Professional, { foreignKey: 'professional_id', as: 'professional'  });

// Export everything
export {
  sequelize,
  User,
  Professional,
  Schedule,
  Payment,
  CommunityPost,
  Comment,
  Like,
  Category,
  AdminAction,
  AISuggestion,
  UserModel,
  ProfessionalModel,
  ScheduleModel,
  PaymentModel,
  CommunityPostModel,
  CommentModel,
  LikeModel,
  CategoryModel,
  AdminActionModel,
  AISuggestionModel,
};
