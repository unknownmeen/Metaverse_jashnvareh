import { gql } from "@apollo/client";

// ─── Fragments ────────────────────────────────────────────────

export const USER_FRAGMENT = gql`
  fragment UserFields on User {
    id
    phone
    role
    judgeLevel
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
    slug
    name
    creatorId
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
    slug
    url
    galleryUrls
    title
    description
    isTopImage
    tags
    festivalId
    userId
    averageRating
    judgeAverageRating
    commentCount
    judgeRatingCount
    createdAt
    author {
      ...UserFields
    }
    festival {
      id
      slug
      name
      creatorId
    }
  }
  ${USER_FRAGMENT}
`;

export const COMMENT_FRAGMENT = gql`
  fragment CommentFields on Comment {
    id
    text
    isAdminReview
    isJudgeReview
    ratingScore
    ratingMaxScore
    imageId
    userId
    parentCommentId
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
    imageId
    imageSlug
    festivalId
    festivalSlug
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

// ─── Release / Changelog ────────────────────────────────────

export const RELEASE_FRAGMENT = gql`
  fragment ReleaseFields on Release {
    id
    version
    published
    publishedAt
    features
    improvements
    bugFixes
    createdAt
    updatedAt
  }
`;

export const GET_RELEASES_QUERY = gql`
  query Releases {
    releases {
      ...ReleaseFields
    }
  }
  ${RELEASE_FRAGMENT}
`;

export const GET_PUBLISHED_RELEASES_QUERY = gql`
  query PublishedReleases {
    publishedReleases {
      ...ReleaseFields
    }
  }
  ${RELEASE_FRAGMENT}
`;

export const GET_LATEST_PUBLISHED_RELEASE_QUERY = gql`
  query LatestPublishedRelease {
    latestPublishedRelease {
      ...ReleaseFields
    }
  }
  ${RELEASE_FRAGMENT}
`;

export const GET_RELEASE_QUERY = gql`
  query Release($version: String!) {
    release(version: $version) {
      ...ReleaseFields
    }
  }
  ${RELEASE_FRAGMENT}
`;

export const CREATE_RELEASE_MUTATION = gql`
  mutation CreateRelease($input: CreateReleaseInput!) {
    createRelease(input: $input) {
      ...ReleaseFields
    }
  }
  ${RELEASE_FRAGMENT}
`;

export const UPDATE_RELEASE_MUTATION = gql`
  mutation UpdateRelease($id: String!, $input: UpdateReleaseInput!) {
    updateRelease(id: $id, input: $input) {
      ...ReleaseFields
    }
  }
  ${RELEASE_FRAGMENT}
`;

export const DELETE_RELEASE_MUTATION = gql`
  mutation DeleteRelease($id: String!) {
    deleteRelease(id: $id)
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
  query GetFestival($idOrSlug: String!) {
    festival(idOrSlug: $idOrSlug) {
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

export const UPDATE_FESTIVAL_MUTATION = gql`
  mutation UpdateFestival($input: UpdateFestivalInput!) {
    updateFestival(input: $input) {
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

export const DELETE_FESTIVAL_MUTATION = gql`
  mutation DeleteFestival($festivalId: ID!) {
    deleteFestival(festivalId: $festivalId)
  }
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
  query GetImage($idOrSlug: String!) {
    image(idOrSlug: $idOrSlug) {
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

export const UPDATE_IMAGE_MUTATION = gql`
  mutation UpdateImage($input: UpdateImageInput!) {
    updateImage(input: $input) {
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

export const DELETE_IMAGE_MUTATION = gql`
  mutation DeleteImage($imageId: ID!) {
    deleteImage(imageId: $imageId) {
      id
    }
  }
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

export const ADD_OWNER_REPLY_MUTATION = gql`
  mutation AddOwnerReply($input: ReplyToCommentInput!) {
    addOwnerReply(input: $input) {
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

export const ADD_JUDGE_REVIEW_MUTATION = gql`
  mutation AddJudgeReview($input: AddCommentInput!) {
    addJudgeReview(input: $input) {
      ...CommentFields
    }
  }
  ${COMMENT_FRAGMENT}
`;

export const UPDATE_COMMENT_MUTATION = gql`
  mutation UpdateComment($input: UpdateCommentInput!) {
    updateComment(input: $input) {
      ...CommentFields
    }
  }
  ${COMMENT_FRAGMENT}
`;

export const DELETE_COMMENT_MUTATION = gql`
  mutation DeleteComment($commentId: ID!) {
    deleteComment(commentId: $commentId) {
      id
    }
  }
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
