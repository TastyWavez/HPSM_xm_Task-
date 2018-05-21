if (record.assignee_name !== null && oldrecord.assignee_name == null){
     system.library.imTask.terminateEvent(record);
}