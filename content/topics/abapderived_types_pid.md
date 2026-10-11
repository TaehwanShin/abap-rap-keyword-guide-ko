---
title: %pid (임시 ID)
summary: late numbering 에서 최종 키가 정해지기 전까지 인스턴스를 가리키는 임시 ID 로, save sequence 의 adjust_numbers 에서 최종 키로 바뀝니다.
keywords: %pid, preliminary ID, 임시 ID, ABP_BEHV_PID, late numbering, 늦은 번호 부여, adjust_numbers, mapped, %cid, %tky, %pky, 임시 키
---

## 설명

`%pid` 는 BDEF derived type(BDEF 파생 타입)의 구성요소이고 타입은 `ABP_BEHV_PID` 입니다. RAP BO 인스턴스의 **임시 ID** 로 쓰며, behavior definition(동작 정의)에 [[abenbdl_late_numbering|late numbering]] 을 정의했을 때만 있습니다. save sequence(저장 순서)에서 `%pid` 는 최종 키 값으로 바뀝니다.

단계별로 보면 이렇습니다.

- **interaction phase(상호작용 단계)** : [[abapmodify_entity_entities_op|생성 작업]]을 처리하는 handler method(핸들러 메서드)에서 인스턴스에 `%pid` 를 임시 식별자로 붙입니다. 이 메서드에서는 response parameter(응답 매개변수) `mapped` 에 [[abapderived_types_cid|%cid]] 와 `%pid` 를 짝지어 넣어야 합니다.
- **save sequence** : 실제 저장을 하는 [[abensaver_method_save|save]] 메서드보다 먼저 [[abensaver_adjust_numbers|adjust_numbers]] 메서드가 불립니다. 이 메서드가 `%pid` 를 최종 키 값으로 바꿉니다.

### late numbering 에서 인스턴스를 가리키는 법

- `%cid` 와 [[abapderived_types_cid_ref|%cid_ref]] 는 interaction phase 안, 지금의 EML 요청에서만 잠깐 쓸 수 있습니다. save sequence 에서는 더 쓸 수 없습니다. 반면 `%pid` 는 save sequence 에서도 인스턴스의 유일한 식별자로 남아 있다가 `adjust_numbers` 에서 최종 키로 바뀝니다. 그래서 `%pid` 는 최종 키가 만들어질 때까지 **오래 유지되는 안정된 ID** 입니다. 최종 키는 인스턴스를 만든 뒤 한참 지나서 만들어질 수도 있습니다. [[abenbdl_with_draft|draft]] 시나리오라면 며칠이나 몇 주 뒤일 수도 있습니다.
- RAP BO consumer(사용자) 쪽에서는 `%cid` 나 `%cid_ref` 말고 `%pid` 로도 인스턴스를 가리킬 수 있습니다. 권하는 방법은 구성요소 묶음 [[abapderived_types_tky|%tky]] 를 쓰는 것입니다. `%tky` 에는 `%pid` 뿐 아니라 다른 것도 들어 있습니다. 예를 들어 임시 키를 `%pid` 대신 [[abapderived_types_key|%key]] 에 담기로 했다면 그 `%key` 도 들어 있습니다.

### 쓰이는 곳

- `%pid` 는 late numbering 에서만 나옵니다. static action 과 static function, `TYPE TABLE FOR KEY OF`, `TYPE STRUCTURE FOR KEY OF` 에는 없습니다.
- 생성 작업에서는 `%cid` 를 새로 만든 `%pid` 에 짝지어야 합니다. 둘 다 [[abaptype_response_for|mapped]] response parameter 에 넣습니다.
- interaction phase 에서 내부 처리가 이루어지려면, 인스턴스는 언제나 트랜잭션 키(`%tky`)로 유일하게 가려져야 합니다. 그런데 late numbering 에서는 interaction phase 와, `save` 가 불리기 전 save sequence 의 앞쪽 단계에서 임시 키로 인스턴스를 가리킵니다. 최종 키는 `adjust_numbers` 에서야 정해집니다. 그래서 late numbering 의 `%tky` 에는 임시 ID `%pid` 도 들어 있습니다. draft 시나리오처럼 ABAP 세션이 여러 번 바뀌는 동안에도 유일함을 지키기 위해서입니다.
- `%tky` 에는 `%pid` 말고 `%key` 도 들어 있습니다. `%key` 도 임시 식별자로 쓸 수 있습니다. 잠깐만 유효한 값을 키 필드에 넣어 두고 `adjust_numbers` 에서 최종 키로 바꾸는 방식입니다. 곧 `%pid` 와 `%key` 가운데 하나만 임시 식별자로 쓰고 다른 하나는 비워 두어도 되고, 둘을 함께 써도 됩니다. 어느 쪽이든 `%tky` 전체가 인스턴스를 유일하게 가려야 합니다.

## 예제

late numbering 을 쓰는 unmanaged BO 의 생성 handler method 입니다. 인스턴스마다 `%pid` 를 만들고, `mapped` 에 `%cid` 와 짝지어 넣습니다.

```abap
METHOD create.
  LOOP AT entities ASSIGNING FIELD-SYMBOL(<ls_entity>).
    " 임시 ID 로 쓸 UUID 를 만든다
    TRY.
        DATA(lv_pid) = cl_system_uuid=>create_uuid_x16_static( ).
      CATCH cx_uuid_error.
        APPEND VALUE #( %cid = <ls_entity>-%cid ) TO failed-travel.
        CONTINUE.
    ENDTRY.

    " transactional buffer 에 새 인스턴스를 임시 ID 와 함께 넣는다
    APPEND VALUE #( cid        = <ls_entity>-%cid
                    pid        = lv_pid
                    agencyid   = <ls_entity>-agencyid
                    customerid = <ls_entity>-customerid ) TO lcl_buffer=>mt_travel.

    " %cid 와 %pid 를 짝지어 mapped 에 넣는다
    APPEND VALUE #( %cid = <ls_entity>-%cid
                    %pid = lv_pid
                    %key = <ls_entity>-%key ) TO mapped-travel.
  ENDLOOP.
ENDMETHOD.
```

여기서 `lcl_buffer=>mt_travel` 은 직접 만든 transactional buffer(트랜잭션 버퍼, 내부 테이블)입니다.

## 알아두기

- root entity(루트 엔터티)에 `late numbering` 을 적으면 composition 트리 전체가 그것을 물려받습니다. 따라서 최종 키를 정하기 전까지는, 인스턴스의 계층 구조와 composition 이 아닌 association 에도 `%pid` 가 반영되어야 합니다.
- `%pid` 는 구성요소 묶음 `%tky` 와 [[abapderived_types_pky|%pky]] 에 들어 있습니다. `%pky` 자체는 `%tky` 의 구성요소입니다.

## 관련 항목

- [[abapderived_types_keys_identifiers]]
- [[abapderived_types_tky]]
- [[abapderived_types_pky]]
- [[abapderived_types_pre]]
- [[abenbdl_late_numbering]]
- [[abensaver_adjust_numbers]]
- [[abapconvert_key]]
- [[abenderived_types_pid_abexa]]
- [[abenderived_types_pre_tmp_abexa]]
