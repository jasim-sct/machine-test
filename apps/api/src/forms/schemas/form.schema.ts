import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type FormDocument = Form & Document;

@Schema({ timestamps: true })
export class Form {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  userId: string;

  @Prop({ required: true, unique: true, index: true })
  publicId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'FormVersion', default: null })
  deployedVersionId: string | null;

  createdAt?: Date;
  updatedAt?: Date;
}

export const FormSchema = SchemaFactory.createForClass(Form);
FormSchema.set('toJSON', {
  transform: (_, ret: any) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});
