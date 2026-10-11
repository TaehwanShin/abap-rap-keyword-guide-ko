---
title: 키와 인스턴스 식별에 쓰는 구성요소
summary: BDEF derived type 에서 RAP BO 인스턴스를 가리키는 데 쓰는 %cid, %key, %tky, %pid 같은 구성요소를 모아 둔 갈래입니다.
keywords: %cid, %cid_ref, %is_draft, %key, %pid, %pky, %pre, %skey, %tky, %tmp, 키 구성요소, 인스턴스 식별, 구성요소 묶음, 트랜잭션 키
---

## 설명

EML 로 RAP BO 를 다룰 때는 "어느 인스턴스인가"를 정확히 가리켜야 합니다. BDEF derived type(BDEF 파생 타입)에는 이 일을 하는 `%` 구성요소가 여러 개 있습니다. 이 갈래는 그 구성요소를 하나씩 설명합니다.

쓰임새로 나누면 크게 이렇습니다.

- 이미 키가 있는 인스턴스를 가리키는 것 : `%key`, `%tky`, `%pky`
- 생성 요청에서 새 인스턴스에 이름을 붙이고, 같은 요청 안에서 그 인스턴스를 가리키는 것 : `%cid`, `%cid_ref`
- draft 인지 active(활성)인지 나타내는 것 : `%is_draft`
- late numbering 에서 임시 식별자를 다루는 것 : `%pid`, `%pre`, `%tmp`
- key function 에서 대체 키를 담는 것 : `%skey`

처음이라면 전체 그림을 정리한 [[abapderived_types_keys_identifiers]] 부터 읽기를 권합니다.

## 하위 항목

- [[abapderived_types_keys_identifiers]] : 키와 인스턴스 식별 방법을 한눈에 정리한 글입니다.
- [[abapderived_types_cid]] : 생성 요청에서 새 인스턴스에 붙이는 임시 이름표(내용 ID)입니다.
- [[abapderived_types_cid_ref]] : 같은 요청 안에서 `%cid` 로 이름 붙인 인스턴스를 가리킵니다.
- [[abapderived_types_is_draft]] : 인스턴스가 draft 인지 active 인지 나타내는 표시입니다.
- [[abapderived_types_key]] : 기본 키 필드를 묶은 구성요소 묶음입니다.
- [[abapderived_types_pid]] : late numbering 에서 최종 키가 정해지기 전까지 쓰는 임시 ID 입니다.
- [[abapderived_types_pky]] : `%key` 와, late numbering 일 때는 `%pid` 까지 묶은 구성요소 묶음입니다.
- [[abapderived_types_pre]] : `%pid` 와 `%tmp` 를 묶은 것으로, `adjust_numbers` 에서 임시 식별자를 가리킵니다.
- [[abapderived_types_skey]] : key function 의 입력에서 대체 키를 담는 구성요소 묶음입니다.
- [[abapderived_types_tky]] : 인스턴스를 빈틈없이 가리키는 트랜잭션 키입니다. `%key` 와 `%is_draft` 등이 들어 있습니다.
- [[abapderived_types_tmp]] : `adjust_numbers` 에서 `%key` 에 들어 있던 임시 키 값을 담는 구성요소 묶음입니다.

## 관련 항목

- [[abapderived_types_comp]]
- [[abapderived_types_info]]
- [[abapderived_types_misc]]
