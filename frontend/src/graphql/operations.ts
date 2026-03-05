import { gql } from "@apollo/client";

// ─── Fragments ────────────────────────────────────────────────

export const USER_FRAGMENT = gql`
  fragment UserFields on User {
    id
    phone
    role
    gender
    realName
    displayName
    avatarUrl
    visibleName
    createdAt
  }
`;

export const FESTIVAL_FRAGMENT = gql`
  fragment FestivalFields on Festival {
    id
    name
    coverImageUrl
    conceptMediaType
    conceptMediaUrl
    conceptText
    rulesText
    status
    imageCount
    createdAt
    updatedAt
  }
`;

export const IMAGE_FRAGMENT = gql`
  fragment ImageFields on Image {
    id
    url
    title
    isTopImage
    tags
    festivalId
    userId
    averageRating
    commentCount
    createdAt
    author {
      ...UserFields
    }
  }
  ${USER_FRAGMENT}
`;

export const COMMENT_FRAGMENT = gql`
  fragment CommentFields on Comment {
    id
    text
    isAdminReview
    imageId
    userId
    createdAt
    author {
      ...UserFields
    }
  }
  ${USER_FRAGMENT}
`;

export const NOTIFICATION_FRAGMENT = gql`
  fragment NotificationFields on Notification {
    id
    type
    text
    isRead
    userId
    senderId
    createdAt
  }
`;

// ─── Auth ─────────────────────────────────────────────────────

export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      user {
        ...UserFields
      }
    }
  }
  ${USER_FRAGMENT}
`;

export const GET_ME_QUERY = gql`
  query GetMe {
    me {
      ...UserFields
    }
  }
  ${USER_FRAGMENT}
`;

// ─── Users ────────────────────────────────────────────────────

export const UPDATE_PROFILE_MUTATION = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      ...UserFields
    }
  }
  ${USER_FRAGMENT}
`;

// ─── User Management (Super Admin) ───────────────────────────────

export const GET_ALL_USERS_QUERY = gql`
  query GetAllUsers {
    allUsers {
      ...UserFields
    }
  }
  ${USER_FRAGMENT}
`;

export const CREATE_USERS_MUTATION = gql`
  mutation CreateUsers($inputs: [CreateUserInput!]!) {
    createUsers(inputs: $inputs) {
      ...UserFields
    }
  }
  ${USER_FRAGMENT}
`;

export const UPDATE_USERS_MUTATION = gql`
  mutation UpdateUsers($updates: [UpdateUserByIdInput!]!) {
    updateUsers(updates: $updates) {
      ...UserFields
    }
  }
  ${USER_FRAGMENT}
`;

export const CHANGE_ROLES_MUTATION = gql`
  mutation ChangeRoles($changes: [ChangeRoleInput!]!) {
    changeRoles(changes: $changes) {
      ...UserFields
    }
  }
  ${USER_FRAGMENT}
`;

export const DELETE_USERS_MUTATION = gql`
  mutation DeleteUsers($ids: [String!]!) {
    deleteUsers(ids: $ids)
  }
`;

// ─── Festivals ────────────────────────────────────────────────

export const GET_FESTIVALS_QUERY = gql`
  query GetFestivals {
    festivals {
      ...FestivalFields
    }
  }
  ${FESTIVAL_FRAGMENT}
`;

export const GET_FESTIVAL_QUERY = gql`
  query GetFestival($id: ID!) {
    festival(id: $id) {
      ...FestivalFields
    }
  }
  ${FESTIVAL_FRAGMENT}
`;

export const CREATE_FESTIVAL_MUTATION = gql`
  mutation CreateFestival($input: CreateFestivalInput!) {
    createFestival(input: $input) {
      ...FestivalFields
    }
  }
  ${FESTIVAL_FRAGMENT}
`;

export const UPDATE_FESTIVAL_STATUS_MUTATION = gql`
  mutation UpdateFestivalStatus($input: UpdateFestivalStatusInput!) {
    updateFestivalStatus(input: $input) {
      ...FestivalFields
    }
  }
  ${FESTIVAL_FRAGMENT}
`;

// ─── Images ───────────────────────────────────────────────────

export const GET_FESTIVAL_IMAGES_QUERY = gql`
  query GetFestivalImages($festivalId: ID!) {
    festivalImages(festivalId: $festivalId) {
      ...ImageFields
    }
  }
  ${IMAGE_FRAGMENT}
`;

export const GET_MY_IMAGES_QUERY = gql`
  query GetMyImages {
    myImages {
      ...ImageFields
    }
  }
  ${IMAGE_FRAGMENT}
`;

export const GET_IMAGE_QUERY = gql`
  query GetImage($id: ID!) {
    image(id: $id) {
      ...ImageFields
    }
  }
  ${IMAGE_FRAGMENT}
`;

export const UPLOAD_IMAGE_MUTATION = gql`
  mutation UploadImage($input: UploadImageInput!) {
    uploadImage(input: $input) {
      ...ImageFields
    }
  }
  ${IMAGE_FRAGMENT}
`;

export const TOGGLE_TOP_IMAGE_MUTATION = gql`
  mutation ToggleTopImage($imageId: ID!) {
    toggleTopImage(imageId: $imageId) {
      ...ImageFields
    }
  }
  ${IMAGE_FRAGMENT}
`;

// ─── Comments ─────────────────────────────────────────────────

export const GET_IMAGE_COMMENTS_QUERY = gql`
  query GetImageComments($imageId: ID!) {
    imageComments(imageId: $imageId) {
      ...CommentFields
    }
  }
  ${COMMENT_FRAGMENT}
`;

export const ADD_COMMENT_MUTATION = gql`
  mutation AddComment($input: AddCommentInput!) {
    addComment(input: $input) {
      ...CommentFields
    }
  }
  ${COMMENT_FRAGMENT}
`;

export const ADD_ADMIN_REVIEW_MUTATION = gql`
  mutation AddAdminReview($input: AddCommentInput!) {
    addAdminReview(input: $input) {
      ...CommentFields
    }
  }
  ${COMMENT_FRAGMENT}
`;

// ─── Ratings ──────────────────────────────────────────────────

export const GET_IMAGE_AVERAGE_RATING_QUERY = gql`
  query GetImageAverageRating($imageId: ID!) {
    imageAverageRating(imageId: $imageId) {
      average
      count
    }
  }
`;

export const RATE_IMAGE_MUTATION = gql`
  mutation RateImage($input: RateImageInput!) {
    rateImage(input: $input) {
      id
      score
      imageId
      userId
      createdAt
    }
  }
`;

// ─── Notifications ────────────────────────────────────────────

export const GET_MY_NOTIFICATIONS_QUERY = gql`
  query GetMyNotifications {
    myNotifications {
      ...NotificationFields
    }
  }
  ${NOTIFICATION_FRAGMENT}
`;

export const MARK_NOTIFICATION_READ_MUTATION = gql`
  mutation MarkNotificationAsRead($id: ID!) {
    markNotificationAsRead(id: $id) {
      ...NotificationFields
    }
  }
  ${NOTIFICATION_FRAGMENT}
`;

export const MARK_ALL_NOTIFICATIONS_READ_MUTATION = gql`
  mutation MarkAllNotificationsAsRead {
    markAllNotificationsAsRead
  }
`;
