export default function(model: any): any {
  const offset = new Date().getTimezoneOffset()
  if (model?.created) model.created = new Date( model.created.getTime() -  offset * 60000 ) 
  if (model?.updated) model.updated = new Date( model.updated.getTime() -  offset * 60000 ) 
  return model
}